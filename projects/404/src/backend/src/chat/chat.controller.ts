import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createConversation(@Body() body: CreateConversationDto) {
    return this.chatService.createConversation(body);
  }

  @Get('conversations')
  listConversations(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.chatService.listConversations(userId);
  }

  @Get('conversations/:conversationId/messages')
  listMessages(@Param('conversationId') conversationId: string, @Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.chatService.listMessages(conversationId, userId);
  }

  @Post('messages')
  sendMessage(@Body() body: SendMessageDto, @Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.chatService.sendMessage({
      ...body,
      senderId: userId,
    });
  }
}
