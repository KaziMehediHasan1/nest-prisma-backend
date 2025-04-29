import { Injectable, BadRequestException } from '@nestjs/common';
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

  public async setupPlannerProfile(
    rawData: SetupPlannerProfileDto,
  ): Promise<ApiResponse<any>> {
    const { userId, image,eventPreferenceIds, ...rest } = rawData;

    const fileInstance = await this.upload.uploadFile({
      file: image,
    });

    try {
      const profile = await this.db.profile.create({
        data: {
          ...rest,
          image: {
            connect: {
              id: fileInstance.id,
            },
          },
          eventPreference:{
            connect: eventPreferenceIds.map(id => ({id}))
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return {
        data: profile,
        message: 'Profile created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (fileInstance) {
        this.event.emit('FILE_DELETE', {
          Key: fileInstance.fileId,
        });
      }
      throw new BadRequestException(error.message);
    }
  }

  public async setUpVenueOwnerProfile(
    rawData: SetupVenueOwnerProfileDto,
  ): Promise<ApiResponse<any>> {
    const { userId, image , ...rest } = rawData;
    const fileInstance = await this.upload.uploadFile({
      file: image,
    });
    try {
      const profile = await this.db.profile.create({
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
      });

      return {
        data: profile,
        message: 'Profile created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (fileInstance) {
        this.event.emit('FILE_DELETE', {
          Key: fileInstance.fileId,
        });
      }
      throw new BadRequestException(error.message);
    }
  }

  public async setUpServiceProviderProfile(
    rawData: SetupServiceProviderProfileDto,
  ): Promise<ApiResponse<any>> {
    const { coverPhoto, image, userId, location, eventPreferenceIds, ...rest } = rawData;

    
    const [profilePic, coverPhotoPic] = await Promise.all([
      await this.upload.uploadFile({
        file: image,
      }),
      await this.upload.uploadFile({
        file: coverPhoto,
      }),
    ]);

    try {
      const profile = await this.db.profile.create({
        data: {
          image: {
            connect: {
              id: profilePic.id,
            },
          },
          ...rest,
          eventPreference:{
            connect: eventPreferenceIds.map(id => ({id}))
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
          location,
        },
      });

      return {
        data: profile,
        message: 'Profile created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (profilePic) {
        this.event.emit('FILE_DELETE', {
          Key: profilePic.fileId,
        });
      }
      if (coverPhotoPic) {
        this.event.emit('FILE_DELETE', {
          Key: coverPhotoPic.fileId,
        });
      }
      throw new BadRequestException(error.message);
    }
  }
}
