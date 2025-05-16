import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateWorkShowCaseDto } from '../dto/createWorkShowCase.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { FileInstance } from '@prisma/client';
import { UpdateWorkShowCaseDto } from '../dto/updateWroke.dto';

@Injectable()
export class WorksService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
  ) {}

  public async createWork(
    { id }: IdDto,
    rawData: CreateWorkShowCaseDto,
  ): Promise<ApiResponse<any>> {
    const { files, eventTypeId, ...rest } = rawData;
    const filesInstance = await Promise.all(
      files.map((file) => this.uploadService.uploadFile({ file })),
    );
    try {
      const work = await this.db.works.create({
        data: {
          ...rest,
          files: {
            connect: filesInstance.map((file) => ({ id: file.id })),
          },
          Profile: {
            connect: {
              id,
            },
          },
          EventType: {
            connect: {
              id: eventTypeId,
            },
          },
        },
        include: {
          files: {
            select: {
              path: true,
            },
          },
        },
      });

      return {
        data: work,
        message: 'Work created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      filesInstance.forEach((file) => {
        this.uploadService.deleteFile({
          Key: file.fileId,
        });
      });
      throw new BadRequestException(`unable to create work\n${error}`);
    }
  }

  public async getAllWorkById({ id }: IdDto): Promise<ApiResponse<any>> {
    const data = await this.db.works.findMany({
      where: {
        Profile: {
          id,
        },
      },
      include: {
        files: {
          select: {
            path: true,
          },
          take: 1,
        },
      },
    });
    return {
      data,
      message: 'Works fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  public async getWorkById({ id }: IdDto): Promise<ApiResponse<any>> {
    const data = await this.db.works.findUnique({
      where: {
        id,
      },
      include: {
        files: {
          select: {
            path: true,
          },
        },
      },
    });
    return {
      data,
      message: 'Work fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  public async updateWork(
    workId: string,
    profileId: string,
    rawData: UpdateWorkShowCaseDto,
  ): Promise<ApiResponse<any>> {
    // First, check if work exists and belongs to the profile
    const existingWork = await this.db.works.findFirst({
      where: {
        id: workId,
        Profile: {
          id: profileId,
        },
      },
      include: {
        files: true,
      },
    });

    if (!existingWork) {
      throw new NotFoundException(
        'Work not found or you do not have permission to update it',
      );
    }

    const { files, eventTypeId, ...rest } = rawData;
    let newFilesInstance: FileInstance[] = [];
    try {
      // Create update data object
      const updateData: any = { ...rest };

      // Handle event type update if provided
      if (eventTypeId) {
        updateData.EventType = {
          connect: { id: eventTypeId },
        };
      }

      // Handle files if provided

      if (files && files.length > 0) {
        // Upload new files
        newFilesInstance = await Promise.all(
          files.map((file) => this.uploadService.uploadFile({ file })),
        );

        // Disconnect existing files
        if (existingWork.files && existingWork.files.length > 0) {
          // Delete old files from storage
          existingWork.files.forEach((file) => {
            if (file.fileId) {
              this.uploadService.deleteFile({
                Key: file.fileId,
              });
            }
          });

          // Update database relationships
          updateData.files = {
            disconnect: existingWork.files.map((file) => ({ id: file.id })),
            connect: newFilesInstance.map((file) => ({ id: file.id })),
          };
        } else {
          // Just connect new files if there were no existing ones
          updateData.files = {
            connect: newFilesInstance.map((file) => ({ id: file.id })),
          };
        }
      }

      // Update the work in database
      const updatedWork = await this.db.works.update({
        where: { id: workId },
        data: updateData,
        include: {
          files: {
            select: {
              path: true,
            },
          },
        },
      });

      return {
        data: updatedWork,
        message: 'Work updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      // Clean up any newly uploaded files in case of error
      if (files && files.length > 0) {
        newFilesInstance.forEach((file) => {
          this.uploadService.deleteFile({
            Key: file.fileId,
          });
        });
      }
      throw new BadRequestException(`Unable to update work\n${error}`);
    }
  }

  public async deleteWork(
    workId: string,
    profileId: string,
  ): Promise<ApiResponse<any>> {
    // First, check if work exists and belongs to the profile
    const existingWork = await this.db.works.findFirst({
      where: {
        id: workId,
        Profile: {
          id: profileId,
        },
      },
      include: {
        files: true,
      },
    });

    if (!existingWork) {
      throw new NotFoundException(
        'Work not found or you do not have permission to delete it',
      );
    }

    try {
      // Delete associated files from storage
      if (existingWork.files && existingWork.files.length > 0) {
        await Promise.all(
          existingWork.files.map((file) => {
            if (file.fileId) {
              return this.uploadService.deleteFile({
                Key: file.fileId,
              });
            }
          }),
        );
      }

      // Delete the work from database
      await this.db.works.delete({
        where: { id: workId },
      });

      return {
        data: null,
        message: 'Work deleted successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Unable to delete work\n${error}`);
    }
  }
}
