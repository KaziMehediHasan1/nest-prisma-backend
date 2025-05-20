import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationConsumers } from './consumers/notification.consumers';


@Global()
@Module({
  providers: [NotificationConsumers],
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  exports:[BullModule]
})
export class QueuesModule {}
