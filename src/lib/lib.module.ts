import { Global, Module } from '@nestjs/common';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { UploadService } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { FileInstanceCronService } from 'src/cron/FileInstanceCronService';
import { MailService } from './mail/mail.service';
import { EventService } from './event/event.service';

@Global()
@Module({
  providers: [UtilService, DbService, UploadService, FileInstanceCronService, MailService, EventService],
  exports: [UtilService, DbService, UploadService, FileInstanceCronService, EventService],
  controllers: [UploadController],
})
export class LibModule {}