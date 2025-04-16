import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateDirectChatDto } from './dto/createChat.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { CreateDirectMessageDto } from './dto/createMessage.dto';
import { FileInstance } from '@prisma/client';
import { EventService } from 'src/lib/event/event.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
  ) {}

  private async findConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
      },
      include: {
        memberOne: {
          select: {
            id: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  private async createConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.create({
      data: {
        memberTwoId,
        memberOneId,
      },
    });
  }

  async getOrCreateConversation(rawData: CreateDirectChatDto) {
    const { memberOneId, memberTwoId } = rawData;

    const conversation = await this.findConversation(memberOneId, memberTwoId);

    if (conversation) {
      return conversation;
    }

    return await this.createConversation(memberOneId, memberTwoId);
  }

  async createMessage(rawData: CreateDirectMessageDto) {
    const { file } = rawData;

    const isConversionExist = await this.findConversation(
      rawData.memberId,
      rawData.conversationId,
    );

    if (!isConversionExist) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }

    let fileInstance: FileInstance | null = null;

    if (file) {
      fileInstance = await this.uploadService.uploadFile({
        file,
      });
    }

    try {
      return await this.db.directMessage.create({
        data: {
          content: rawData.content,
          conversation: {
            connect: {
              id: rawData.conversationId,
            },
          },
          file: {
            connect: fileInstance
              ? {
                  id: fileInstance.id,
                }
              : undefined,
          },
          member: {
            connect: {
              id: rawData.memberId,
            },
          },
        },
      });
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
