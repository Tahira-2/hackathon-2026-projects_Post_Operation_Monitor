import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { MessageSender, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

const conversationSelect = {
  id: true,
  userIds: true,
  createdAt: true,
} satisfies Prisma.ConversationSelect;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  senderType: true,
  content: true,
  metadata: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

type ConversationPayload = Prisma.ConversationGetPayload<{
  select: typeof conversationSelect;
}>;

type MessagePayload = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

export interface DoctorSuggestion {
  doctorId: string;
  doctorName: string;
  specialization: string;
  workingHours: { day: string; startTime: string; endTime: string }[];
}

@Injectable()
export class ChatService {
  private readonly geminiModel = 'gemini-3-flash-preview';
  private readonly geminiApiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENAI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  private readonly geminiClient = this.geminiApiKey
    ? new GoogleGenAI({ apiKey: this.geminiApiKey })
    : null;

  constructor(private readonly prisma: PrismaService) {}

  async createConversation(dto: CreateConversationDto) {
    const uniqueUserIds = [
      ...new Set(dto.userIds.map((id) => id.trim())),
    ].filter((id) => id.length > 0);

    if (uniqueUserIds.length < 1 || uniqueUserIds.length > 2) {
      throw new BadRequestException('Conversation must include 1 or 2 users');
    }

    return this.prisma.conversation.create({
      data: { userIds: uniqueUserIds },
      select: conversationSelect,
    });
  }

  async findConversationById(id: string): Promise<ConversationPayload> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      select: conversationSelect,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async listMessages(conversationId: string): Promise<MessagePayload[]> {
    await this.findConversationById(conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: messageSelect,
    });
  }

  async sendMessage(dto: SendMessageDto): Promise<{
    message: MessagePayload;
    aiMessage: MessagePayload | null;
  }> {
    const conversation = await this.findConversationById(dto.conversationId);

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: dto.senderId,
        senderType: dto.senderType ?? MessageSender.USER,
        content: dto.content,
        metadata: this.toJsonValue(dto.metadata),
      },
      select: messageSelect,
    });

    const shouldGenerateAiReply =
      conversation.userIds.length === 1 &&
      message.senderType !== MessageSender.SYSTEM;

    if (!shouldGenerateAiReply) {
      return { message, aiMessage: null };
    }

    const { aiContent, doctorSuggestions } = await this.generateAiReply(
      conversation,
      message,
    );

    const aiMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 'SYSTEM',
        senderType: MessageSender.SYSTEM,
        content: aiContent,
        metadata: this.toJsonValue({
          model: this.geminiModel,
          ...(doctorSuggestions.length > 0 ? { doctorSuggestions } : {}),
        }),
      },
      select: messageSelect,
    });

    return { message, aiMessage };
  }

  /**
   * Fetches available doctors, optionally filtered by specialization keyword.
   */
  async fetchAvailableDoctors(
    specializationKeyword?: string,
  ): Promise<DoctorSuggestion[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: specializationKeyword
        ? {
            specialization: {
              name: { contains: specializationKeyword, mode: 'insensitive' },
            },
          }
        : undefined,
      select: {
        id: true,
        user: { select: { fullName: true } },
        specialization: { select: { name: true } },
        workingHours: {
          select: { day: true, startTime: true, endTime: true },
          orderBy: { day: 'asc' },
        },
      },
      take: 5,
    });

    return doctors.map((d) => ({
      doctorId: d.id,
      doctorName: d.user.fullName,
      specialization: d.specialization.name,
      workingHours: d.workingHours.map((wh) => ({
        day: wh.day,
        startTime: wh.startTime,
        endTime: wh.endTime,
      })),
    }));
  }

  private async generateAiReply(
    conversation: ConversationPayload,
    message: MessagePayload,
  ): Promise<{ aiContent: string; doctorSuggestions: DoctorSuggestion[] }> {
    const userId = conversation.userIds[0] ?? message.senderId;

    if (!this.geminiClient) {
      return {
        aiContent:
          'I can only answer healthcare questions in your care context. I am currently unavailable because the AI key is not configured.',
        doctorSuggestions: [],
      };
    }

    const [profile, history, allDoctors] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, role: true },
      }),
      this.prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: { senderType: true, content: true, createdAt: true },
      }),
      this.fetchAvailableDoctors(),
    ]);

    const doctorsContext = allDoctors
      .map(
        (d) =>
          `- ${d.doctorName} (${d.specialization}): available ${d.workingHours.map((wh) => `${wh.day} ${wh.startTime}-${wh.endTime}`).join(', ')}`,
      )
      .join('\n');

    const isDoctor = profile?.role === 'DOCTOR';

    const roleContext = isDoctor
      ? [
          'The user is a DOCTOR on the CareFlow platform.',
          'You are their clinical AI assistant. You may discuss:',
          '- Clinical decision support (diagnosis differentials, treatment options, drug interactions)',
          '- Evidence-based medicine and latest clinical guidelines',
          '- Patient management strategies and care planning',
          '- ICD/CPT coding guidance, documentation tips',
          '- Scheduling and workflow questions',
          'Respond with appropriate medical depth and clinical precision.',
          'Always remind the doctor that final clinical decisions rest with them.',
        ]
      : [
          'The user is a PATIENT on the CareFlow platform.',
          'You are their friendly healthcare assistant. You may discuss:',
          '- General health questions and symptom information',
          '- Medication reminders and basic drug info',
          '- Preparation for upcoming appointments',
          '- When to seek emergency care',
          'Use simple, empathetic language. Never diagnose.',
          'Always recommend consulting their doctor for specific medical advice.',
        ];

    const prompt = [
      'You are CareFlow AI, a professional healthcare assistant for a telemedicine platform.',
      ...roleContext,
      '',
      `User profile: ${JSON.stringify(profile ?? { id: userId })}`,
      `Conversation history: ${JSON.stringify(history)}`,
      `Latest message: ${message.content}`,
      '',
      ...(isDoctor
        ? [
            '=== CURRENT DOCTOR ROSTER (for scheduling/referral context) ===',
            doctorsContext || 'No other doctors currently listed.',
            '=== END ===',
            '',
            'Keep responses concise and clinically relevant (2-4 sentences). Do NOT emit SUGGEST_DOCTORS.',
          ]
        : [
            '=== AVAILABLE DOCTORS FOR REFERRAL ===',
            doctorsContext || 'No doctors currently available.',
            '=== END ===',
            '',
            'IMPORTANT:',
            '1. If the patient mentions symptoms or asks for a specialist, give a brief health tip AND end your reply with EXACTLY one line:',
            '   SUGGEST_DOCTORS:<comma-separated specialization keywords>',
            '   Example: SUGGEST_DOCTORS:Cardiology,General Medicine',
            '2. Only suggest doctors when clearly relevant to the patient\'s health query.',
            '3. Be warm, concise (2-3 sentences), and always suggest consulting a clinician for diagnoses.',
          ]),
    ].join('\n');

    let rawText = '';
    try {
      const response = await this.geminiClient.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
      });

      const directText =
        typeof (response as { text?: unknown }).text === 'string'
          ? (response as { text: string }).text.trim()
          : '';

      if (directText.length > 0) {
        rawText = directText;
      } else {
        rawText =
          response.candidates
            ?.flatMap((candidate) => candidate.content?.parts ?? [])
            .map((part) => part.text ?? '')
            .join(' ')
            .trim() ?? '';
      }
    } catch {
      return {
        aiContent:
          'I can only help with healthcare-related questions in your care context.',
        doctorSuggestions: [],
      };
    }

    // Parse SUGGEST_DOCTORS directive
    let doctorSuggestions: DoctorSuggestion[] = [];
    const suggestMatch = rawText.match(/SUGGEST_DOCTORS:([^\n]+)/i);
    let aiContent = rawText;

    if (suggestMatch) {
      // Strip directive from visible text
      aiContent = rawText.replace(/SUGGEST_DOCTORS:[^\n]*/i, '').trim();

      const keywords = suggestMatch[1]
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      // Fetch matching doctors for each keyword
      const results = await Promise.all(
        keywords.map((kw) => this.fetchAvailableDoctors(kw)),
      );
      const allMatched = results.flat();
      // Deduplicate by doctorId
      const seen = new Set<string>();
      doctorSuggestions = allMatched.filter((d) => {
        if (seen.has(d.doctorId)) return false;
        seen.add(d.doctorId);
        return true;
      });

      // Fallback: if no specialization match found, return all doctors
      if (doctorSuggestions.length === 0) {
        doctorSuggestions = allDoctors;
      }
    }

    return { aiContent: aiContent || rawText, doctorSuggestions };
  }

  private toJsonValue(
    value: Record<string, unknown> | undefined,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value as Prisma.InputJsonValue;
  }
}
