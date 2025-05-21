import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationEvent } from 'src/common/types/NotificationEvent';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_TYPES } from 'src/interfaces/event';

@Injectable()
export class EventServiceService {
    constructor(
        @InjectQueue('notification') private readonly notificationQueue: Queue,
    ) {}

    @OnEvent(EVENT_TYPES.NOTIFICATION_SEND)
    async sendNotification(rawData:NotificationEvent){
        await this.notificationQueue.add('notification', rawData);
    }

    @OnEvent(EVENT_TYPES.BULK_NOTIFICATION_SEND)
    async sendBulkNotification(rawData:NotificationEvent[]){
        await Promise.all(rawData.map((data) => this.notificationQueue.add('notification', data)));
    }
}
