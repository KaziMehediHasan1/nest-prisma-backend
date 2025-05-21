import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationEvent } from 'src/common/types/NotificationEvent';
import { NotificationJobPayload } from 'src/interfaces/notification';
import { DbService } from 'src/lib/db/db.service';
import { NotificationService } from 'src/main/notification/services/notification.service';
import validator from 'validator';

@Processor('notification')
export class NotificationConsumers extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumers.name);

  constructor(
    private readonly db: DbService,
    private readonly NotificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<NotificationEvent>) {
    this.logger.debug(`Processing job ${job.id}...`);
    await this.saveNotification({
      profileId: job.data.profileId,
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
    });
    await this.NotificationService.sendPushNotification({
      token: job.data.fcmToken,
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
      id: job.data.profileId,
    });
  }

  public async saveNotification(rawData: NotificationJobPayload) {
    const { profileId, title, body, data } = rawData;

    if (!profileId || !title || !body) {
      this.logger.error('Invalid job payload');
      return;
    }

    await this.validateUUID(profileId);

    try {
      const notification = await this.db.notification.create({
        data: {
          Profile: {
            connect: { id: profileId },
          },
          title,
          body,
          ...(data && { data }),
        },
      });
      this.logger.debug(`Notification saved: ${notification.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
    }
  }

  validateUUID(id: string): boolean {
    if (!validator.isUUID(id)) {
      this.logger.error(`Invalid UUID: ${id}`);
    }

    return true;
  }

  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
