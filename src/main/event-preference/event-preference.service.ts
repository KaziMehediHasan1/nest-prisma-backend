import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEventPreferenceDto } from './dto/create-event-preference.dto';
import { UpdateEventPreferenceDto } from './dto/update-event-preference.dto';
import { DbService } from 'src/lib/db/db.service';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventPreferenceService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private eventEmitter: EventEmitter2,
  ) {}
  public async create(createEventPreference: CreateEventPreferenceDto) {
    if (!createEventPreference.avatar)
      throw new HttpException('No avatar provided', HttpStatus.BAD_REQUEST);

    const fileInstance = await this.uploadService.uploadFile({
      file: createEventPreference.avatar,
    });

    const data = await this.db.eventPreference
      .create({
        data: {
          name: createEventPreference.name,
          Profile: {
            connect: {
              id: createEventPreference.profileId,
            },
          },
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

    return data;
  }

  findAll() {
    return this.db.eventPreference.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} eventPreference`;
  }

  async update(id: string, updateEventPreferenceDto: UpdateEventPreferenceDto) {
    // First check if the event preference exists
    const existingPreference = await this.db.eventPreference.findUnique({
      where: { id },
      include: {
        avatar: true,
      },
    });
  
    if (!existingPreference) {
      throw new HttpException('Event preference not found', HttpStatus.NOT_FOUND);
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
      const updatedPreference = await this.db.eventPreference.update({
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
  
      return updatedPreference;
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
