import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageSender, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { McpService } from '../mcp/mcp.service';

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

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mcpService: McpService,
  ) {}

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

  async listConversations(userId: string): Promise<ConversationPayload[]> {
    return this.prisma.conversation.findMany({
      where: {
        userIds: { has: userId },
      },
      orderBy: { createdAt: 'desc' },
      select: conversationSelect,
    });
  }

  async findOrCreateSystemConversation(userId: string): Promise<ConversationPayload> {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { userIds: { has: userId } },
          { userIds: { has: 'SYSTEM' } },
        ],
      },
      select: conversationSelect,
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userIds: [userId, 'SYSTEM'] },
        select: conversationSelect,
      });
    }

    return conversation;
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

  async listMessages(conversationId: string, userId?: string): Promise<MessagePayload[]> {
    if (conversationId === 'SYSTEM' && userId) {
      const systemConv = await this.findOrCreateSystemConversation(userId);
      conversationId = systemConv.id;
    }
    await this.findConversationById(conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: messageSelect,
    });
  }

  async saveUserMessage(dto: SendMessageDto): Promise<MessagePayload> {
    let conversationId = dto.conversationId;
    if (conversationId === 'SYSTEM') {
      const systemConv = await this.findOrCreateSystemConversation(dto.senderId!);
      conversationId = systemConv.id;
    }

    return this.prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: dto.senderId!,
        senderType: dto.senderType ?? MessageSender.USER,
        content: dto.content,
        metadata: this.toJsonValue(dto.metadata),
      },
      select: messageSelect,
    });
  }

  async generateAiReply(userMessage: MessagePayload): Promise<MessagePayload | null> {
    const conversation = await this.findConversationById(userMessage.conversationId);
    
    const shouldGenerateAiReply =
      (conversation.userIds.length === 1 || conversation.userIds.includes('SYSTEM')) &&
      userMessage.senderType !== MessageSender.SYSTEM;

    if (!shouldGenerateAiReply) {
      return null;
    }

    // Fetch history for AI context
    const history = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { senderType: true, content: true, createdAt: true },
    });

    try {
      const { aiContent, doctorSuggestions, actions } = await this.mcpService.generateAiReply(
        userMessage.senderId,
        conversation.id,
        userMessage.content!,
        history,
      );

      return await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: 'SYSTEM',
          senderType: MessageSender.SYSTEM,
          content: aiContent,
          metadata: this.toJsonValue({
            model: 'gemini-2.5-flash',
            ...(doctorSuggestions.length > 0 ? { doctorSuggestions } : {}),
            ...(actions && actions.length > 0 ? { actions } : {}),
          }),
        },
        select: messageSelect,
      });
    } catch (err) {
      console.error("[generateAiReply] Error:", err);
      return null;
    }
  }

  async sendMessage(dto: SendMessageDto): Promise<{
    message: MessagePayload;
    aiMessage: MessagePayload | null;
  }> {
    const message = await this.saveUserMessage(dto);
    const aiMessage = await this.generateAiReply(message);
    return { message, aiMessage };
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
