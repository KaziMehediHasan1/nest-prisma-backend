import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDirectMessageDto } from './dto/createMessage.dto';
import { CreateDirectChatDto } from './dto/createChat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Create a new message with video or attachments',
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateDirectMessageDto
) {
    const rawData = {
        ...data,
        file,
    }
    return this.chatService.createMessage(rawData);
  }

  @Post('create-conversation')
  createConversation(@Body() data: CreateDirectChatDto) {
    return this.chatService.getOrCreateConversation(data);
  }
}
