import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { get } from 'http';

@Controller('works')
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@ApiBearerAuth()
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Post('create-work-showcase')
  @Roles('SERVICE_PROVIDER')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 20 }]))
  @ApiConsumes('multipart/form-data')
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

  @Get('get-all-by-service-provider')
  @Roles('SERVICE_PROVIDER')
  async get(@Req() { user: { profileId: id } }: AuthenticatedRequest) {
    if (!id) {
      throw new BadRequestException('Profile not Created');
    }
    return this.worksService.getAllWorkById({ id });
  }

  @Get('get-all/:id')
  async getAll(@Param() id: IdDto) {
    
    return this.worksService.getAllWorkById( id );
  }

  @Get('get/:id')
  async getWorkById(@Param() id: IdDto) {
    return this.worksService.getWorkById(id);
  }
}
