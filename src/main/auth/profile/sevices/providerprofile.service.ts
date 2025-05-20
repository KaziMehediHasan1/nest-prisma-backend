import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import {
  
  SetupServiceProviderProfileDto,
 
} from '../dto/setupProflie.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { ApiResponse } from 'src/interfaces/response';
import {
  UpdateServiceProviderProfile,
} from '../dto/updateProfile.dto';
import { FileInstance, Prisma } from '@prisma/client';
import { AuthService } from '../../services/auth.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class providerProfileService {
  constructor(
    private readonly db: DbService,
    private readonly upload: UploadService,
    private readonly event: EventService,
    private readonly authService: AuthService,
  ) {}

  


  public async setUpServiceProviderProfile(
    rawData: SetupServiceProviderProfileDto,
    userId:string
    
  ): Promise<ApiResponse<any>> {
    const {
      coverPhoto,
      image,
      
      location,
      eventPreferenceIds,
      serviceTypeId,
      ...rest
    } = rawData;

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
          eventPreference: {
            connect: eventPreferenceIds.map((id) => ({ id })),
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
          serviceType: {
            connect: {
              id: serviceTypeId,
            },
          },
          gender: 'OTHER',
          location,
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


  public async updateServiceProviderProfile(
    profileId: string,
    rawData: UpdateServiceProviderProfile,
  ): Promise<ApiResponse<any>> {
    const {
      image,
      coverPhoto,
      eventPreferenceIds,
      name,
      userName,
      serviceTypeId,
      ...rest
    } = rawData;

    let profilePic: FileInstance | null = null;
    let coverPhotoPic: FileInstance | null = null;

    try {
      // First check if profile exists
      const existingProfile = await this.db.profile.findFirst({
        where: { id: profileId },
        include: {
          user: true,
        },
      });

      if (!existingProfile) {
        throw new NotFoundException('Profile not found');
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
        ...(serviceTypeId
          ? { serviceType: { connect: { id: serviceTypeId } } }
          : {}),
      };

      // Handle file uploads

      // Upload files if provided
      if (image && coverPhoto) {
        [profilePic, coverPhotoPic] = await Promise.all([
          this.upload.uploadFile({ file: image }),
          this.upload.uploadFile({ file: coverPhoto }),
        ]);
      } else if (image) {
        profilePic = await this.upload.uploadFile({ file: image });
      } else if (coverPhoto) {
        coverPhotoPic = await this.upload.uploadFile({ file: coverPhoto });
      }

      // Add profile image if uploaded
      if (profilePic) {
        updateData.image = {
          connect: {
            id: profilePic.id,
          },
        };

        // Delete previous image if it exists
        if (existingProfile.imageId) {
          this.event.emit('FILE_DELETE', {
            Key: existingProfile.imageId,
          });
        }
      }

      // Add cover photo if uploaded
      if (coverPhotoPic) {
        updateData.coverPhoto = {
          connect: {
            id: coverPhotoPic.id,
          },
        };

        // Delete previous cover photo if it exists
        if (existingProfile.coverPhotoId) {
          this.event.emit('FILE_DELETE', {
            Key: existingProfile.coverPhotoId,
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
      // Clean up any uploaded files if there was an error
      if (error instanceof NotFoundException) {
        throw error;
      }

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

  public async getServiceProviderProfile(
    { take, skip }: PaginationDto,
    id?: string,
    search?: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.db.profile.findMany({
      where: {
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
        ...(id && {
          serviceType: {
            some: {
              id,
            },
          },
        }),
        user: {
          role: {
            has: 'SERVICE_PROVIDER',
          },
        },
      },
      include: {
        user: {
          select: {
            role: true,
            name: true,
            isVerified: true,
            createdAt: true,
            email: true,
          },
        },
        serviceType: true,
        image: {
          select: {
            path: true,
          },
        },
      },
      take,
      skip,
    });
    return {
      data,
      message: 'Service provider profile fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
