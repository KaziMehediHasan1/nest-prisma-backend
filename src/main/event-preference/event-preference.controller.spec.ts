import { Test, TestingModule } from '@nestjs/testing';
import { EventPreferenceController } from './event-preference.controller';
import { EventPreferenceService } from './event-preference.service';

describe('EventPreferenceController', () => {
  let controller: EventPreferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPreferenceController],
      providers: [EventPreferenceService],
    }).compile();

    controller = module.get<EventPreferenceController>(EventPreferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
