import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationConsumers } from './consumers/notification.consumers';
import { NotificationService } from 'src/main/notification/services/notification.service';
import { FirebaseService } from 'src/main/notification/services/firebase.service';


@Global()
@Module({
  providers: [NotificationConsumers, NotificationService, FirebaseService],
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  exports:[BullModule]
})
export class QueuesModule {}
