import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProviderTypeController } from './service-provider-type.controller';
import { ServiceProviderTypeService } from './service-provider-type.service';

describe('ServiceProviderTypeController', () => {
  let controller: ServiceProviderTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceProviderTypeController],
      providers: [ServiceProviderTypeService],
    }).compile();

    controller = module.get<ServiceProviderTypeController>(ServiceProviderTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
