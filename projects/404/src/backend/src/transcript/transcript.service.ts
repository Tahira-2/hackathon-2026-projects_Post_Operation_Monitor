import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { CallsGateway } from '../calls/calls.gateway';

@Injectable()
export class TranscriptService {
  private speechClient: SpeechClient;
  private gemini: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CallsGateway))
    private readonly callsGateway: CallsGateway,
    private readonly httpService: HttpService,
  ) {
    this.speechClient = new SpeechClient();
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  // ─── Save a single audio chunk: run STT and persist ──────────────────────

  async saveChunk(callSessionId: string, speaker: string, audioBase64: string) {
    // Verify session exists
    const session = await this.prisma.callSession.findUnique({
      where: { id: callSessionId },
    });
    if (!session) throw new NotFoundException('Call session not found');

    // Run Google Speech-to-Text on the chunk
    let text = '';
    try {
      const audioBytes = Buffer.from(audioBase64, 'base64');
      const [response] = await this.speechClient.recognize({
        config: {
          encoding: 'WEBM_OPUS' as any,
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
        audio: { content: audioBytes.toString('base64') },
      });
      text = response.results
        ?.map((r) => r.alternatives?.[0]?.transcript ?? '')
        .join(' ')
        .trim() ?? '';
    } catch (err) {
      console.error('[transcript] STT error:', err?.message);
      // Still save even if STT fails (empty content)
    }

    if (!text) return { saved: false, text: '' };

    const chunk = await this.prisma.transcriptChunk.create({
      data: { callSessionId, speaker, content: text },
    });

    // Broadcast live caption immediately!
    this.callsGateway.broadcastCaption(callSessionId, speaker, text);

    return { saved: true, text, chunkId: chunk.id };
  }

  /** Save a text chunk to DB and broadcast */
  async saveTranscriptChunk(
    callSessionId: string,
    speaker: string,
    content: string,
  ) {
    const chunk = await this.prisma.transcriptChunk.create({
      data: { callSessionId, speaker, content },
    });

    // Broadcast live caption immediately!
    this.callsGateway.broadcastCaption(callSessionId, speaker, content);

    return chunk;
  }

  // ─── Fetch all chunks for a session ─────────────────────────────────────

  async getTranscript(callSessionId: string) {
    const chunks = await this.prisma.transcriptChunk.findMany({
      where: { callSessionId },
      orderBy: { timestamp: 'asc' },
    });
    return chunks;
  }

  // ─── Generate summary via Gemini ─────────────────────────────────────────

  async generateSummary(callSessionId: string) {
    const chunks = await this.getTranscript(callSessionId);
    if (chunks.length === 0) throw new NotFoundException('No transcript found for this session');

    // Build readable transcript
    const fullTranscript = chunks
      .map((c) => `${c.speaker}: ${c.content}`)
      .join('\n');

    // 1. Call FastAPI for structured extraction
    let mlExtracted = {
      symptoms: [] as string[],
      conditions: [] as string[],
      medicines: [] as string[],
      dosages: [] as string[],
      instructions: [] as string[],
      advice: [] as string[],
      summary: ''
    };

    try {
      console.log(`[transcript] calling FastAPI at http://localhost:8000/extract`);
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/extract', { transcript: fullTranscript })
      );
      mlExtracted = response.data;
    } catch (err) {
      console.error(`[transcript] FastAPI call failed:`, err?.message);
      // Fallback: we will rely entirely on Gemini below
    }

    // 2. Call Gemini for clinical summary (using ML results as context if available)
    const prompt = `You are a medical scribe. Below is a transcript of a telemedicine consultation.
    
    TRANSCRIPT:
    ${fullTranscript}
    
    ML EXTRACTED DATA (USE AS HINTS):
    ${JSON.stringify(mlExtracted)}

    Generate a structured clinical summary in JSON with these exact fields:
    {
      "summary": "A 2-4 sentence SOAP-style clinical summary",
      "diagnoses": ["list", "of", "confirmed", "or", "suspected", "diagnoses"],
      "medications": ["list", "of", "recommended", "medications"],
      "followUp": "Follow-up instructions or null"
    }

    Return ONLY valid JSON.`;

    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();

    let parsed: { summary: string; diagnoses: string[]; medications: string[]; followUp?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { 
        summary: mlExtracted.summary || raw, 
        diagnoses: mlExtracted.conditions || [], 
        medications: mlExtracted.medicines || [], 
        followUp: undefined 
      };
    }

    // Upsert summary in DB
    const saved = await this.prisma.consultationSummary.upsert({
      where: { callSessionId },
      update: {
        summary: parsed.summary,
        diagnoses: parsed.diagnoses ?? [],
        medications: parsed.medications ?? [],
        followUp: parsed.followUp ?? null,
      },
      create: {
        callSessionId,
        summary: parsed.summary,
        diagnoses: parsed.diagnoses ?? [],
        medications: parsed.medications ?? [],
        followUp: parsed.followUp ?? null,
      },
    });

    return saved;
  }

  // ─── Get existing summary ────────────────────────────────────────────────

  async getSummary(callSessionId: string) {
    return this.prisma.consultationSummary.findUnique({ where: { callSessionId } });
  }

  // ─── Apply Medications ────────────────────────────────────────────────────

  async applyMedications(callSessionId: string) {
    const summary = await this.prisma.consultationSummary.findUnique({
      where: { callSessionId },
      include: {
        callSession: {
          select: { patientId: true }
        }
      }
    });

    if (!summary) throw new NotFoundException('Summary not found');
    if (summary.isMedicationApplied) return summary;

    const patientId = summary.callSession.patientId;

    // Start transaction to save everything
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Medications
      if (summary.medications && summary.medications.length > 0) {
        await tx.patientMedication.createMany({
          data: summary.medications.map(med => ({
            patientId,
            name: med,
            isActive: true,
            notes: `Prescribed during consultation on ${new Date().toLocaleDateString()}`
          }))
        });
      }

      // 2. Create Care Plan / Follow-up
      if (summary.followUp || summary.summary) {
        await tx.carePlan.create({
          data: {
            patientId,
            title: `Follow-up from Consultation`,
            instructions: summary.followUp || summary.summary,
            createdAt: new Date()
          }
        });
      }

      // 3. Mark as applied
      return tx.consultationSummary.update({
        where: { callSessionId },
        data: { isMedicationApplied: true },
      });
    });
  }

  // ─── Get all summaries for a patient ────────────────────────────────────

  async getPatientHistory(patientId: string) {
    return this.prisma.consultationSummary.findMany({
      where: {
        callSession: {
          patientId: patientId,
        },
      },
      include: {
        callSession: {
          include: {
            appointment: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        fullName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
