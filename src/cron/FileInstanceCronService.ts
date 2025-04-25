import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from 'src/lib/db/db.service';
import { UploadService } from 'src/lib/upload/upload.service';

@Injectable()
export class FileInstanceCronService {
  private readonly logger = new Logger(FileInstanceCronService.name);
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES) // You can adjust the schedule as necessary
  async updateExpiringFileUrls() {
    const files = await this.db.fileInstance.findMany({
      where: {
        expiresAt: {
          lt: new Date(Date.now() + 3600 * 24 * 1 * 1000), 
        },
      },
    });

    for (const file of files) {
      const newUrl = await this.uploadService.getPresignedUrl(
        file.fileId,
        3600 * 24 * 7,
      ); // Expires in another week
      this.logger.log(`Updating URL for file ${file.id}`);
      await this.db.fileInstance.update({
        where: { id: file.id },
        data: {
          path: newUrl,
          expiresAt: new Date(Date.now() + 3600 * 24 * 7 * 1000), // Update expiration date
        },
      });
    }
  }
}
