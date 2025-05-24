import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { SendNotificationDto } from './dto/sendNotification.dto';
import { AuthGuard } from '@nestjs/passport';
import { SaveFcmTokenDto } from './dto/saveFcm.dot';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from 'src/lib/event/event.service';
import { CursorDto } from 'src/common/dto/cursor.dto';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventService
  ) {}

  @Post('send')
  async sendNotification(@Body() data: SendNotificationDto) {
   await this.eventEmitter.emit('NOTIFICATION_SEND', {
     fcmToken: data.token,
     title: data.title,
     body: data.body,
     data: data.data,
     profileId: data.id
   });

   return { success: true, message: 'Notification sent successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('save')
  @ApiBearerAuth()
  async saveFcm(
    @Body() data: SaveFcmTokenDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.notificationService.saveFcm({ id: req.user.profileId }, data);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('get')
  @ApiBearerAuth()
  async getNotification(
    @Req() req: AuthenticatedRequest,
    @Query() rawDate: CursorDto
  ) {
    if (!req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
      return this.notificationService.getNotification({ id: req.user.profileId }, rawDate);
  }

}
