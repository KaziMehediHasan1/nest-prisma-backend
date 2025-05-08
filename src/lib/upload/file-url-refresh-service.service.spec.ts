import { Test, TestingModule } from '@nestjs/testing';
import { FileUrlRefreshServiceService } from './file-url-refresh-service.service';

describe('FileUrlRefreshServiceService', () => {
  let service: FileUrlRefreshServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUrlRefreshServiceService],
    }).compile();

    service = module.get<FileUrlRefreshServiceService>(FileUrlRefreshServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
