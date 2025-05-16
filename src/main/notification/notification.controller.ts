import { Controller } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import * as admin from 'firebase-admin';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
}
