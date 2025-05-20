import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ProfileModule } from './profile/profile.module';
import { AuthGateway } from './auth.gateway';
import { AutUserhService } from './services/authuser.service';
import { AuthpasswordService } from './services/authpassword.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGateway,AutUserhService,AuthpasswordService],
  imports: [ProfileModule],
})
export class AuthModule {}
