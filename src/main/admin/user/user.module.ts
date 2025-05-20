import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

import { JwtService } from '@nestjs/jwt';
import { GetProfileService } from './services/get-profile.service';
import { AuthService } from 'src/main/auth/services/auth.service';
import { AutUserhService } from 'src/main/auth/services/authuser.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AutUserhService, JwtService, GetProfileService],
})
export class UserModule {}
