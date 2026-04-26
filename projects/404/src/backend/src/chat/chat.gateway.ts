import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinRoomDto, SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/communication',
  cors: { origin: '*' },
})
export class CommunicationGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    client.join(payload.conversationId);
    return {
      event: 'joinedRoom',
      data: {
        conversationId: payload.conversationId,
      },
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const message = await this.chatService.saveUserMessage(payload);

    client.broadcast.to(payload.conversationId).emit('messageCreated', message);

    const conversation = await this.chatService.findConversationById(message.conversationId);
    const isSystemChat = conversation.userIds.includes('SYSTEM');

    if (isSystemChat) { 
       this.server.to(message.conversationId).emit('typing', { senderId: 'SYSTEM', isTyping: true });
    }

    this.chatService.generateAiReply(message).then((aiMessage) => {
      if (aiMessage) {
        this.server.to(message.conversationId).emit('messageCreated', aiMessage);
      }
      if (isSystemChat) this.server.to(message.conversationId).emit('typing', { senderId: 'SYSTEM', isTyping: false });
    }).catch((err) => {
      console.error("[generateAiReply Async Error]", err);
      if (isSystemChat) this.server.to(message.conversationId).emit('typing', { senderId: 'SYSTEM', isTyping: false });
    });

    return {
      event: 'messageAck',
      data: {
        messageId: message.id,
      },
    };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; senderId: string; isTyping: boolean },
  ) {
    client.to(payload.conversationId).emit('typing', {
      senderId: payload.senderId,
      isTyping: payload.isTyping,
    });
  }
}
