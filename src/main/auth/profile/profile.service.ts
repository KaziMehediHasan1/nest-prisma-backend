import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './dto/setupProflie.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { ApiResponse } from 'src/interfaces/response';
import { UpdatePlannerProfile, UpdateServiceProviderProfile, UpdateVenueOwnerProfile } from './dto/updateProfile.dto';
import { FileInstance } from '@prisma/client';

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

  public async updatePlannerProfile(
    profileId: string,
    rawData: UpdatePlannerProfile,
  ): Promise<ApiResponse<any>> {
    const { image, eventPreferenceIds, ...rest } = rawData;
    
    try {
      // First check if profile exists
      const existingProfile = await this.db.profile.findFirst({
        where: { id: profileId },
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
      const updateData: any = { ...rest };
      
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
          connect: eventPreferenceIds.map(id => ({ id })),
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

  public async updateVenueOwnerProfile(
    profileId: string,
    rawData: UpdateVenueOwnerProfile,
  ): Promise<ApiResponse<any>> {
    const { image, ...rest } = rawData;
    
    try {
      // First check if profile exists
      const existingProfile = await this.db.profile.findFirst({
        where: { id: profileId },
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
      const updateData: any = { ...rest };
      
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

  
  public async updateServiceProviderProfile(
    profileId: string,
    rawData: UpdateServiceProviderProfile,
  ): Promise<ApiResponse<any>> {
    const { image, coverPhoto, eventPreferenceIds, ...rest } = rawData;
    
    let profilePic:FileInstance|null = null;
    let coverPhotoPic:FileInstance|null = null;

    try {
      // First check if profile exists
      const existingProfile = await this.db.profile.findFirst({
        where: { id: profileId },
      });

      if (!existingProfile) {
        throw new NotFoundException('Profile not found');
      }

      // Prepare update data
      const updateData: any = { ...rest };
      
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
          connect: eventPreferenceIds.map(id => ({ id })),
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

}
