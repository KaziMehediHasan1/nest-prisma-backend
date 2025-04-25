import { Test, TestingModule } from '@nestjs/testing';
import { ProfileVerificationService } from './profile-verification.service';

describe('ProfileVerificationService', () => {
  let service: ProfileVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileVerificationService],
    }).compile();

    service = module.get<ProfileVerificationService>(ProfileVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
