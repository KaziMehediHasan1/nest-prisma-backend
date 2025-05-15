import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProviderTypeService } from './service-provider-type.service';

describe('ServiceProviderTypeService', () => {
  let service: ServiceProviderTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProviderTypeService],
    }).compile();

    service = module.get<ServiceProviderTypeService>(ServiceProviderTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
