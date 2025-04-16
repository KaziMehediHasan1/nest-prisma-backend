import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDirectMessageDto } from './dto/createMessage.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
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
}
