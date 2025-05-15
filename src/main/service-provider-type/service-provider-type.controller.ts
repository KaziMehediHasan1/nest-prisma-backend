import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ServiceProviderTypeService } from './service-provider-type.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { CreateServiceProviderTypeDto } from './dto/createServiceProviderType.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdateServiceTypeDto } from './dto/updateServiceType.dto';
import { IdDto } from 'src/common/dto/id.dto';

@Controller('service-provider-type')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class ServiceProviderTypeController {
  constructor(
    private readonly serviceProviderTypeService: ServiceProviderTypeService,
  ) {}

  @Post('create')
  @Roles('ADMIN')
  create(@Body() data: CreateServiceProviderTypeDto) {
    return this.serviceProviderTypeService.createServiceProviderType(data);
  }

  @Get('get')
  get() {
    return this.serviceProviderTypeService.getServiceProviderType();
  }

  @Patch('update/:id')
  @Roles('ADMIN')
  update(@Param() {id}: IdDto ,@Body() data: UpdateServiceTypeDto) {
    return this.serviceProviderTypeService.updateServiceProviderType({id}, data);
  }

  @Delete('delete/:id')
  @Roles('ADMIN')
  delete(@Param() {id}: IdDto) {
    return this.serviceProviderTypeService.deleteServiceProviderType({id});
  }

}
