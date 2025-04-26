import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEventPreferenceDto } from './dto/create-event-preference.dto';
import { UpdateEventPreferenceDto } from './dto/update-event-preference.dto';
import { DbService } from 'src/lib/db/db.service';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class EventPreferenceService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private eventEmitter: EventService,
  ) {}
  public async create(
    createEventPreference: CreateEventPreferenceDto,
  ): Promise<ApiResponse<any>> {
    if (!createEventPreference.avatar)
      throw new HttpException('No avatar provided', HttpStatus.BAD_REQUEST);

    const fileInstance = await this.uploadService.uploadFile({
      file: createEventPreference.avatar,
    });

    const data = await this.db.eventType
      .create({
        data: {
          name: createEventPreference.name,
          avatar: {
            connect: {
              id: fileInstance.id,
            },
          },
        },
        include: {
          avatar: {
            select: {
              path: true,
            },
          },
        },
      })
      .catch(async (err) => {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: fileInstance.fileId,
        });

        throw err;
      });

    return {
      data,
      message: 'Event preference created successfully',
      statusCode: 201,
      success: true,
    };
  }

  async findAll(): Promise<ApiResponse<any>> {
    const data = await this.db.eventType.findMany({
      include: {
        avatar: {
          select: {
            path: true,
          },
        },
      },
    });

    return {
      data,
      message: 'Event preferences fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} eventPreference`;
  }

  async update(id: string, updateEventPreferenceDto: UpdateEventPreferenceDto): Promise<ApiResponse<any>> {
    // First check if the event preference exists
    const existingPreference = await this.db.eventType.findUnique({
      where: { id },
      include: {
        avatar: true,
      },
    });

    if (!existingPreference) {
      throw new HttpException(
        'Event preference not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const updateData: any = {};

    if (updateEventPreferenceDto.name) {
      updateData.name = updateEventPreferenceDto.name;
    }

    if (updateEventPreferenceDto.profileId) {
      updateData.Profile = {
        connect: {
          id: updateEventPreferenceDto.profileId,
        },
      };
    }

    let newFileInstance;
    if (updateEventPreferenceDto.avatar) {
      newFileInstance = await this.uploadService.uploadFile({
        file: updateEventPreferenceDto.avatar,
      });

      updateData.avatar = {
        connect: {
          id: newFileInstance.id,
        },
      };
    }

    try {
      const updatedPreference = await this.db.eventType.update({
        where: { id },
        data: updateData,
        include: {
          avatar: {
            select: {
              path: true,
            },
          },
        },
      });

      if (newFileInstance && existingPreference.avatar) {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: existingPreference.avatar.fileId,
        });
      }

      return {
        data: updatedPreference,
        message: 'Event preference updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (err) {
      if (newFileInstance) {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: newFileInstance.fileId,
        });
      }

      Logger.error('Failed to update event preference', err);
      throw err;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} eventPreference`;
  }
}
