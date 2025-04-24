import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ProfileModule } from './profile/profile.module';
import { AuthGateway } from './auth.gateway';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGateway],
  imports: [ProfileModule],
})
export class AuthModule {}
