import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { SendNotificationDto } from '../dto/sendNotification.dto';
import { DbService } from 'src/lib/db/db.service';
import { IdDto } from 'src/common/dto/id.dto';
import { SaveFcmTokenDto } from '../dto/saveFcm.dot';
import { ApiResponse } from 'src/interfaces/response';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NotificationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly db: DbService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendPushNotification({
    token,
    title,
    body,
    data,
  }: SendNotificationDto) {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };

      await this.notificationQueue.add('notification', {});

      const response = await this.firebaseService.getMessaging().send(message);
      return { success: true, response };
    } catch (error) {
      return { success: false, error };
    }
  }

  public async saveFcm(
    { id }: IdDto,
    { token }: SaveFcmTokenDto,
  ): Promise<ApiResponse<any>> {
    const isExist = await this.db.fcmToken.findUnique({
      where: {
        profileId: id,
      },
    });
    if (isExist) {
      const data = await this.db.fcmToken.update({
        where: {
          profileId: id,
        },
        data: {
          token,
        },
      });

      return {
        data,
        message: 'FCM token updated successfully',
        statusCode: 200,
        success: true,
      };
    }

    const created = await this.db.fcmToken.create({
      data: {
        token,
        Profile: {
          connect: {
            id,
          },
        },
      },
    });
    return {
      data: created,
      message: 'FCM token created successfully',
      statusCode: 200,
      success: true,
    };
  }
}
