import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { GroupModule } from './group/group.module';
import { ChatListModule } from './chat-list/chat-list.module';

@Module({
  providers: [ChatGateway, ChatService, JwtService],
  controllers: [ChatController],
  exports: [ChatService],
  imports: [GroupModule, ChatListModule],
})
export class ChatModule {}
