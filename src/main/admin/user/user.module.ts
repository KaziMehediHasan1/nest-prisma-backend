import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { AuthService } from 'src/main/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { GetProfileService } from './services/get-profile.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, GetProfileService],
})
export class UserModule {}
