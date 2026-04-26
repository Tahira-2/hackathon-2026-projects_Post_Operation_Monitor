import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChatController } from './chat.controller';
import { CommunicationGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [
    McpModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, CommunicationGateway, PrismaService],
})
export class ChatModule {}
