import { Global, Module } from '@nestjs/common';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { UploadService } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { FileInstanceCronService } from 'src/cron/FileInstanceCronService';

@Global()
@Module({
  providers: [UtilService, DbService, UploadService, FileInstanceCronService],
  exports: [UtilService, DbService, UploadService, FileInstanceCronService],
  controllers: [UploadController],
})
export class LibModule {}