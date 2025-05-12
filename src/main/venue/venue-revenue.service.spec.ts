import { Test, TestingModule } from '@nestjs/testing';
import { VenueRevenueService } from './venue-revenue.service';

describe('VenueRevenueService', () => {
  let service: VenueRevenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VenueRevenueService],
    }).compile();

    service = module.get<VenueRevenueService>(VenueRevenueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
