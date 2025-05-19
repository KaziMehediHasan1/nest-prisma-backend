import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { SendNotificationDto } from './dto/sendNotification.dto';
import { AuthGuard } from '@nestjs/passport';
import { SaveFcmTokenDto } from './dto/saveFcm.dot';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(@Body() data: SendNotificationDto) {
    return this.notificationService.sendPushNotification(data);
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
}
