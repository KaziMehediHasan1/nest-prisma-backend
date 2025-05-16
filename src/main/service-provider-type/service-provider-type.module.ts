import { Module } from '@nestjs/common';
import { ServiceProviderTypeService } from './services/service-provider-type.service';
import { ServiceProviderTypeController } from './service-provider-type.controller';

@Module({
  controllers: [ServiceProviderTypeController],
  providers: [ServiceProviderTypeService],
})
export class ServiceProviderTypeModule {}
