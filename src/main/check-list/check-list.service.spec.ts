import { Test, TestingModule } from '@nestjs/testing';
import { CheckListService } from './check-list.service';

describe('CheckListService', () => {
  let service: CheckListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckListService],
    }).compile();

    service = module.get<CheckListService>(CheckListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
