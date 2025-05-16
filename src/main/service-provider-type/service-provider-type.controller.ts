import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceProviderTypeService } from './services/service-provider-type.service';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { CreateServiceProviderTypeDto } from './dto/createServiceProviderType.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdateServiceTypeDto } from './dto/updateServiceType.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('service-provider-type')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class ServiceProviderTypeController {
  constructor(
    private readonly serviceProviderTypeService: ServiceProviderTypeService,
  ) {}

  @Post('create')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() data: CreateServiceProviderTypeDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const rawData = {
      ...data,
      avatar,
    };
    return this.serviceProviderTypeService.createServiceProviderType(rawData);
  }

  @Get('get')
  get() {
    return this.serviceProviderTypeService.getServiceProviderType();
  }

  @Patch('update/:id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param() { id }: IdDto,
    @Body() data: UpdateServiceTypeDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    if (avatar) {
      data.avatar = avatar;
    }
    return this.serviceProviderTypeService.updateServiceProviderType(
      { id },
      data,
    );
  }

  @Delete('delete/:id')
  @Roles('ADMIN')
  delete(@Param() { id }: IdDto) {
    return this.serviceProviderTypeService.deleteServiceProviderType({ id });
  }
}
