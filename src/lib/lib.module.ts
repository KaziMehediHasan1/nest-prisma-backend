import { Global, Module } from '@nestjs/common';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { UploadService } from './upload/upload.service';

@Global()
@Module({
  providers: [UtilService, DbService, UploadService],
  exports: [UtilService, DbService, UploadService],
})
export class LibModule {}
