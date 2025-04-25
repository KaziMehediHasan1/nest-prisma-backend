import { Test, TestingModule } from '@nestjs/testing';
import { CheckListController } from './check-list.controller';
import { CheckListService } from './check-list.service';

describe('CheckListController', () => {
  let controller: CheckListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckListController],
      providers: [CheckListService],
    }).compile();

    controller = module.get<CheckListController>(CheckListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
