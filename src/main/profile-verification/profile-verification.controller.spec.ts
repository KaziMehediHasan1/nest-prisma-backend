import { Test, TestingModule } from '@nestjs/testing';
import { ProfileVerificationController } from './profile-verification.controller';
import { ProfileVerificationService } from './profile-verification.service';

describe('ProfileVerificationController', () => {
  let controller: ProfileVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileVerificationController],
      providers: [ProfileVerificationService],
    }).compile();

    controller = module.get<ProfileVerificationController>(ProfileVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
