import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateWorkShowCaseDto } from './dto/createWorkShowCase.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';

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

  public async getWorkById({id}:IdDto):Promise<ApiResponse<any>>{
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
}
