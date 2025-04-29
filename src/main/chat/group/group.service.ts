import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateManualGroupDto } from './dto/createManulGroup.sto';
import { UploadService } from 'src/lib/upload/upload.service';
import { ApiResponse } from 'src/interfaces/response';
import { CreateDirectMessageDto } from '../dto/createMessage.dto';
import { FileInstance } from '@prisma/client';
import { GroupGateway } from './group.gateway';
import { CreateGroupMessageDto } from './dto/CreateGroupMessage.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly GroupGateway: GroupGateway,
  ) {}

  public async createGroup(
    rawData: CreateManualGroupDto,
  ): Promise<ApiResponse<any>> {
    const { name, image, profileIds } = rawData;
    const fileInstance = await this.uploadService.uploadFile({
      file: image,
    });

    try {
      const group = await this.db.groupMessage.create({
        data: {
          name,
          image: {
            connect: {
              id: fileInstance.id,
            },
          },
          profiles: {
            connect: profileIds.map((id) => ({ id })),
          },
        },
      });
      return {
        data: group,
        message: 'Group created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      await this.uploadService.deleteFile({
        Key: fileInstance.fileId,
      });

      throw new BadRequestException(error);
    }
  }

  public async findGroupById(id: string) {
    return this.db.groupMessage.findUnique({
      where: {
        id,
      },
      include: {
        profiles: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public async findMessagesByGroupId({
    id,
    cursor,
    take,
  }: {
    id: string;
    cursor: string | undefined;
    take: number;
  }) {
    return this.db.directMessage.findMany({
      where: {
        groupMessageId: id,
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

  public async createMessage(rawData: CreateGroupMessageDto) {
    const { file } = rawData;

    const isConversionExist = await this.findGroupById(rawData.groupId);

    if (!isConversionExist) {
      throw new NotFoundException('Conversation not found');
    }

     let fileInstance: FileInstance | null = null;
    
        if (file) {
          fileInstance = await this.uploadService.uploadFile({
            file,
          });
        }

        try {
              const data = await this.db.$transaction(async (tx) => {
                const message = await tx.directMessage.create({
                  data: {
                    content: rawData.content,
                    conversation: {
                      connect: {
                        id: rawData.groupId,
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

                await tx.groupMessage.update({
                  where: {
                    id: rawData.groupId,
                  },
                  data: {
                    lastMessage: {
                      connect: {
                        id: message.id,
                      },
                    },
                  },
                });

                return message
              })
                this.GroupGateway.broadcastToGroup({
                  groupId: rawData.groupId,
                  type: 'create',
                  payload: data,
                })
                return data
            } catch (error) {
              if (fileInstance) {
                this.uploadService.deleteFile({
                  Key: fileInstance.fileId,
                });
              }
              throw new InternalServerErrorException(error);
            }
  }
}
