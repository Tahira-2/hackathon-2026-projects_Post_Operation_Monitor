import { Injectable, NotFoundException } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';

import { CallsGateway } from '../calls/calls.gateway';

@Injectable()
export class TranscriptService {
  private speechClient: SpeechClient;
  private gemini: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly callsGateway: CallsGateway,
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
    const transcript = chunks
      .map((c) => `${c.speaker}: ${c.content}`)
      .join('\n');

    const prompt = `You are a medical scribe. Below is a transcript of a telemedicine consultation between a Doctor and Patient.

TRANSCRIPT:
${transcript}

Generate a structured clinical summary in JSON with these exact fields:
{
  "summary": "A 2-4 sentence SOAP-style clinical summary",
  "diagnoses": ["list", "of", "diagnoses"],
  "medications": ["list", "of", "medications mentioned"],
  "followUp": "Follow-up instructions or null"
}

Return ONLY valid JSON, no markdown or explanation.`;

    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();

    let parsed: { summary: string; diagnoses: string[]; medications: string[]; followUp?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw, diagnoses: [], medications: [], followUp: undefined };
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
}
