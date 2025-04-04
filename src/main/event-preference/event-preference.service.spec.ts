import { Test, TestingModule } from '@nestjs/testing';
import { EventPreferenceService } from './event-preference.service';

describe('EventPreferenceService', () => {
  let service: EventPreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventPreferenceService],
    }).compile();

    service = module.get<EventPreferenceService>(EventPreferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
