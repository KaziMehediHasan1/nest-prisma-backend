import { Global, Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseService } from './services/firebase.service';
import { EventServiceService } from './services/event-service.service';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    FirebaseService,
    EventServiceService,
    NotificationGateway,
    JwtService,
  ],
  exports: [NotificationGateway],
})
export class NotificationModule {}
