import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationJobPayload } from 'src/interfaces/notification';
import { DbService } from 'src/lib/db/db.service';

@Processor('notification')
export class NotificationConsumers extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumers.name);

  constructor(private readonly db: DbService) {
    super();
  }

  async process(job: Job<NotificationJobPayload>) {
    this.logger.debug(`Processing job ${job.data}...`);
    await this.saveNotification(job);
  }

  public async saveNotification(job: Job<NotificationJobPayload>) {
    const { profileId, title, body, data } = job.data;

    if (!profileId || !title || !body) {
      this.logger.error('Invalid job payload');
      return;
    }

    try {
      await this.db.notification.create({
        data: {
          Profile: {
            connect: { id: profileId },
          },
          title,
          body,
          ...(data && { data }),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
    }
  }

  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
