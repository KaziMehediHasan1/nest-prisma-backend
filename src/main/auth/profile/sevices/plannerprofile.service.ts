import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { SetupPlannerProfileDto } from '../dto/setupProflie.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { ApiResponse } from 'src/interfaces/response';
import { UpdatePlannerProfile } from '../dto/updateProfile.dto';
import { Prisma } from '@prisma/client';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class plannerProfileService {
  constructor(
    private readonly db: DbService,
    private readonly upload: UploadService,
    private readonly event: EventService,
    private readonly authService: AuthService,
  ) {}

  public async setupPlannerProfile(
    rawData: SetupPlannerProfileDto,
    userId: string,
  ): Promise<ApiResponse<any>> {
    const { image, eventPreferenceIds, ...rest } = rawData;

    const isProfileExists = await this.db.profile.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (isProfileExists) {
      throw new BadRequestException('Profile already exists');
    }

    const isNameExists = await this.db.profile.findFirst({
      where: {
        name: rest.name,
      },
    });

    if (isNameExists) {
      throw new BadRequestException('Profile name already exists');
    }

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
          eventPreference: {
            connect: eventPreferenceIds.map((id) => ({ id })),
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          user: true,
        },
      });

      return {
        data: {
          profile,
          access_token: await this.authService.generateToken({
            email: profile.user.email,
            roles: profile.user.role,
            id: profile.user.id,
            isVerified: profile.user.isVerified,
            profileId: profile.id,
          }),
        },
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

  public async updatePlannerProfile(
    profileId: string,
    userId: string,
    rawData: UpdatePlannerProfile,
  ): Promise<ApiResponse<any>> {
    const { image, eventPreferenceIds, name, userName, ...rest } = rawData;

    try {
      // First check if profile exists
      const existingProfile = await this.db.profile.findFirst({
        where: { id: profileId, userId },
        include: {
          user: true,
        },
      });

      if (!existingProfile) {
        throw new NotFoundException('Profile not found');
      }

      // Handle image upload if included in update
      let fileInstance;
      if (image) {
        fileInstance = await this.upload.uploadFile({
          file: image,
        });
      }

      // Prepare update data
      const updateData: Prisma.ProfileUpdateInput = {
        ...rest,
        name: userName,
        user: {
          update: {
            name,
          },
        },
      };

      // Add image if uploaded
      if (fileInstance) {
        updateData.image = {
          connect: {
            id: fileInstance.id,
          },
        };

        // Delete previous image if it exists
        if (existingProfile.imageId) {
          this.event.emit('FILE_DELETE', {
            Key: existingProfile.imageId,
          });
        }
      }

      // Handle event preferences if included
      if (eventPreferenceIds && eventPreferenceIds.length > 0) {
        // First disconnect all existing preferences
        await this.db.profile.update({
          where: { id: profileId },
          data: {
            eventPreference: {
              disconnect: await this.db.eventType.findMany({
                where: {
                  profile: {
                    some: {
                      id: profileId,
                    },
                  },
                },
                select: { id: true },
              }),
            },
          },
        });

        // Then connect new preferences
        updateData.eventPreference = {
          connect: eventPreferenceIds.map((id) => ({ id })),
        };
      }

      // Update profile
      const updatedProfile = await this.db.profile.update({
        where: { id: profileId },
        data: updateData,
      });

      return {
        data: updatedProfile,
        message: 'Profile updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
