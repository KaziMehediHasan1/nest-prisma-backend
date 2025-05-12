import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, AuthService, JwtService],
})
export class ProfileModule {}
