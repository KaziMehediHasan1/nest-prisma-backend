import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateDirectChatDto } from './dto/createChat.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { CreateDirectMessageDto } from './dto/createMessage.dto';
import { FileInstance } from '@prisma/client';
import { EventService } from 'src/lib/event/event.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
    private readonly chatGateway: ChatGateway,
  ) {}

  public findConversationById(id: string) {
    return this.db.conversation.findUnique({
      where: {
        id,
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

  public findMessagesByConversationId({
    id,
    cursor,
    take,
  }: {
    id: string;
    take: number;
    cursor: string | undefined;
  }) {
    return this.db.directMessage.findMany({
      where: {
        conversationId: id,
      },
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1, 
          }
        : {}),
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  

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

    const isConversionExist = await this.findConversationById(
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
      const data = await this.db.directMessage
        .create({
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
        })
        this.chatGateway.broadcastToConversation({
          conversationId: rawData.conversationId,
          type: 'create',
          payload: data,
        })
        return data
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
