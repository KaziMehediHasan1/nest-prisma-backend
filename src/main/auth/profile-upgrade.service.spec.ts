import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUpgradeService } from './profile-upgrade.service';

describe('ProfileUpgradeService', () => {
  let service: ProfileUpgradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileUpgradeService],
    }).compile();

    service = module.get<ProfileUpgradeService>(ProfileUpgradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
