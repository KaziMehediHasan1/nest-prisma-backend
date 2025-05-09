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

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateExpiringFileUrls() {
    try {
      // Look for files expiring within 2 days instead of 1 day
      // This gives more buffer time to update URLs before they expire
      const files = await this.db.fileInstance.findMany({
        where: {
          expiresAt: {
            lt: new Date(Date.now() + 3600 * 24 * 2 * 1000), // 2 days
          },
        },
      });

      this.logger.log(`Found ${files.length} files with expiring URLs`);

      for (const file of files) {
        try {
          // Check if the file exists before updating
          const fileExists = await this.db.fileInstance.findUnique({ where: { fileId: file.fileId } }).then((file) => !!file); // Check if file exists by its fileId(file.fileId);
          
          if (!fileExists) {
            this.logger.warn(`File ${file.id} (${file.fileId}) no longer exists in storage`);
            continue;
          }

          // Generate new URL with 7-day expiration
          const newUrl = await this.uploadService.getPresignedUrl(
            file.fileId,
            3600 * 24 * 7, // 7 days in seconds
          );

          // Update the database record
          await this.db.fileInstance.update({
            where: { id: file.id },
            data: {
              path: newUrl,
              expiresAt: new Date(Date.now() + 3600 * 24 * 7 * 1000), // 7 days in milliseconds
            },
          });

          this.logger.log(`Successfully updated URL for file ${file.id}`);
        } catch (fileError) {
          // Individual file errors shouldn't stop the entire process
          this.logger.error(`Error updating URL for file ${file.id}: ${fileError.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update expiring file URLs: ${error.message}`);
    }
  }
}