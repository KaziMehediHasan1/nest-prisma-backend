import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './dto/setupProflie.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: DbService,
    private readonly upload: UploadService,
    private readonly event: EventService,
  ) {}

  public async setupPlannerProfile(rawData: SetupPlannerProfileDto):Promise<ApiResponse<any>> {
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

    return {
      data: profile,
      message: 'Profile created successfully',
      statusCode: 200,
      success: true
    };
  }

  public async setUpVenueOwnerProfile(rawData: SetupVenueOwnerProfileDto):Promise<ApiResponse<any>> {
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

    return {
      data: profile,
      message: 'Profile created successfully',
      statusCode: 200,
      success: true
    };
  }

  public async setUpServiceProviderProfile(
    rawData: SetupServiceProviderProfileDto,
  ):Promise<ApiResponse<any>> {
    const { coverPhoto, image, userId, location } = rawData;

    const [profilePic, coverPhotoPic] = await Promise.all([
      await this.upload.uploadFile({
        file: image,
      }),
      await this.upload.uploadFile({
        file: coverPhoto,
      }),
    ]);

    const profile = await this.db.profile.create({
      data: {
        image: {
          connect: {
            id: profilePic.id,
          },
        },
        coverPhoto: {
          connect: {
            id: coverPhotoPic.id,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        gender: 'OTHER',
        location
      },
    });

    return {
      data: profile,
      message: 'Profile created successfully',
      statusCode: 200,
      success: true
    };
  }
}
