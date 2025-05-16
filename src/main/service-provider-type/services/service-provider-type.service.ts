import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateServiceProviderTypeDto } from '../dto/createServiceProviderType.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateServiceTypeDto } from '../dto/updateServiceType.dto';

@Injectable()
export class ServiceProviderTypeService {
  constructor(
    private readonly dbService: DbService,
    private readonly uploadService: UploadService,
  ) {}

  public async createServiceProviderType(
    rawData: CreateServiceProviderTypeDto,
  ): Promise<ApiResponse<any>> {
    const { avatar, name } = rawData;
    const avatarUrl = await this.uploadService.uploadFile({
      file: avatar,
    });

    try {
      const data = await this.dbService.serviceProviderType.create({
        data: {
          name,
          avatar: {
            connect: {
              id: avatarUrl.id,
            },
          },
        },
      });
      return {
        message: 'Service provider type created successfully',
        data,
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      await this.uploadService.deleteFile({
        Key: avatarUrl.fileId,
      });
      throw new BadRequestException(error);
    }
  }

  public async getServiceProviderType(): Promise<ApiResponse<any>> {
    const data = await this.dbService.serviceProviderType.findMany({
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
      message: 'Service provider type fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  public async getServiceProviderTypeById({
    id,
  }: IdDto): Promise<ApiResponse<any>> {
    const data = await this.dbService.serviceProviderType.findUnique({
      where: {
        id,
      },
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
      message: 'Service provider type fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  public async updateServiceProviderType(
    { id }: IdDto,
    updateData: UpdateServiceTypeDto,
  ): Promise<ApiResponse<any>> {
    let avatarUrl;
    let oldAvatarFileId;
    try {
      // First check if the service provider type exists
      const existingType = await this.dbService.serviceProviderType.findUnique({
        where: { id },
        include: {
          avatar: true,
        },
      });

      if (!existingType) {
        throw new NotFoundException('Service provider type not found');
      }

      // If avatar is provided in update, upload the new file
      if (updateData.avatar) {
        // Save old file id to delete later if successful
        oldAvatarFileId = existingType.avatar?.fileId;

        // Upload new avatar
        avatarUrl = await this.uploadService.uploadFile({
          file: updateData.avatar,
        });
      }

      // Update the service provider type
      const updatedData = await this.dbService.serviceProviderType.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(avatarUrl && {
            avatar: {
              connect: {
                id: avatarUrl.id,
              },
            },
          }),
        },
        include: {
          avatar: {
            select: {
              path: true,
            },
          },
        },
      });

      // If update was successful and we replaced the avatar, delete the old one
      if (avatarUrl && oldAvatarFileId) {
        await this.uploadService.deleteFile({
          Key: oldAvatarFileId,
        });
      }

      return {
        data: updatedData,
        message: 'Service provider type updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      // If there was an error and we uploaded a new avatar, clean it up
      if (avatarUrl) {
        await this.uploadService.deleteFile({
          Key: avatarUrl.fileId,
        });
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  public async deleteServiceProviderType({
    id,
  }: IdDto): Promise<ApiResponse<any>> {
    try {
      // First get the type to check if it exists and to get associated avatar
      const serviceProviderType =
        await this.dbService.serviceProviderType.findUnique({
          where: { id },
          include: {
            avatar: true,
          },
        });

      if (!serviceProviderType) {
        throw new NotFoundException('Service provider type not found');
      }

      // Delete the service provider type
      await this.dbService.serviceProviderType.delete({
        where: { id },
      });

      // If there was an avatar, delete it as well
      if (serviceProviderType.avatar?.fileId) {
        await this.uploadService.deleteFile({
          Key: serviceProviderType.avatar.fileId,
        });
      }

      return {
        message: 'Service provider type deleted successfully',
        statusCode: 200,
        success: true,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
