import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { IdDto } from 'src/common/dto/id.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { CreateWorkShowCaseDto } from './dto/createWorkShowCase.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { get } from 'http';
import { UpdateWorkShowCaseDto } from './dto/updateWroke.dto';

@Controller('works')
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Post('create-work-showcase')
  @Roles('SERVICE_PROVIDER')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 20 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new work showcase' })
  async createWork(
    @Req() { user: { profileId: id } }: AuthenticatedRequest,
    @Body() data: CreateWorkShowCaseDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: 'image/*'  }),
          // new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max size (optional)
        ],
        fileIsRequired: true,
      }),
    )
    files: { files: Express.Multer.File[] },
  ) {
    if (!id) {
      throw new BadRequestException('Profile not Created');
    }
    const rawData: CreateWorkShowCaseDto = {
      files: files.files,
      description: data.description,
      projectTitle: data.projectTitle,
      eventTypeId: data.eventTypeId,
    };
    return this.worksService.createWork({ id }, rawData);
  }

  @Patch('update-work/:id')
  @Roles('SERVICE_PROVIDER')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 20 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing work showcase' })
  @ApiParam({ name: 'id', description: 'Work ID to update' })
  async updateWork(
    @Req() { user: { profileId } }: AuthenticatedRequest,
    @Param('id') workId: string,
    @Body() data: UpdateWorkShowCaseDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: 'image/*'  }),
          // new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max size (optional)
        ],
        fileIsRequired: false,
      }),
    )
    files?: { files?: Express.Multer.File[] },
  ) {
    if (!profileId) {
      throw new BadRequestException('Profile not Created');
    }

    const rawData: UpdateWorkShowCaseDto = {
      description: data.description,
      projectTitle: data.projectTitle,
      eventTypeId: data.eventTypeId,
    };

    // Only add files if they were uploaded
    if (files && files.files && files.files.length > 0) {
      rawData.files = files.files;
    }

    return this.worksService.updateWork(workId, profileId, rawData);
  }

  @Delete('delete-work/:id')
  @Roles('SERVICE_PROVIDER')
  @ApiOperation({ summary: 'Delete a work showcase' })
  @ApiParam({ name: 'id', description: 'Work ID to delete' })
  async deleteWork(
    @Req() { user: { profileId } }: AuthenticatedRequest,
    @Param('id') workId: string,
  ) {
    if (!profileId) {
      throw new BadRequestException('Profile not Created');
    }

    return this.worksService.deleteWork(workId, profileId);
  }

  @Get('get-all-by-service-provider')
  @Roles('SERVICE_PROVIDER')
  @ApiOperation({ summary: 'Get all works by authenticated service provider' })
  async get(@Req() { user: { profileId: id } }: AuthenticatedRequest) {
    if (!id) {
      throw new BadRequestException('Profile not Created');
    }
    return this.worksService.getAllWorkById({ id });
  }

  @Get('get-all/:id')
  @ApiOperation({ summary: 'Get all works by profile ID' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getAll(@Param() id: IdDto) {
    return this.worksService.getAllWorkById(id);
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Get work by ID' })
  @ApiParam({ name: 'id', description: 'Work ID' })
  async getWorkById(@Param() id: IdDto) {
    return this.worksService.getWorkById(id);
  }
}