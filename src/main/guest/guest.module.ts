import { Module } from '@nestjs/common';
import { GuestService } from './services/guest.service';
import { GuestController } from './guest.controller';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { GuestLinkService } from './services/guestLink.service';

@Module({
  controllers: [GuestController],
  providers: [GuestService, AuthService, JwtService, GuestLinkService],
})
export class GuestModule {}
