import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseService } from './services/firebase.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
})
export class NotificationModule {}
