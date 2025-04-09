import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './dto/setupProflie.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: DbService,
    private readonly upload: UploadService,
    private readonly event: EventService,
  ) {}

  public async setupPlannerProfile(rawData: SetupPlannerProfileDto) {
    const { userId, image, ...rest } = rawData;

    const fileInstance = await this.upload.uploadFile({
      file: image,
    });

    const profile = await this.db.profile
      .create({
        data: {
          ...rest,
          image: {
            connect: {
              id: fileInstance.id,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })
      .catch(() => {
        if (fileInstance) {
          this.event.emit('FILE_DELETE', {
            Key: fileInstance.fileId,
          });
        }
      });

    return profile;
  }

  public async setUpVenueOwnerProfile(rawData: SetupVenueOwnerProfileDto) {
    const { userId, image, ...rest } = rawData;
    const fileInstance = await this.upload.uploadFile({
      file: image,
    });
    const profile = await this.db.profile
      .create({
        data: {
          gender: 'OTHER',
          user: {
            connect: {
              id: userId,
            },
          },
          image: {
            connect: {
              id: fileInstance.id,
            },
          },
          ...rest,
        },
      })
      .catch(() => {
        if (fileInstance) {
          this.event.emit('FILE_DELETE', {
            Key: fileInstance.fileId,
          });
        }
      });

    return profile;
  }

  public async setUpServiceProviderProfile(
    rawData: SetupServiceProviderProfileDto,
  ) {
    const { coverPhoto, image } = rawData;

    const [profilePic, coverPhotoPic] = await Promise.all([
      await this.upload.uploadFile({
        file: image,
      }),
      await this.upload.uploadFile({
        file: coverPhoto,
      }),
    ]);
  }
}
