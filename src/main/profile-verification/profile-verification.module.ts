import { Module } from '@nestjs/common';
import { ProfileVerificationService } from './services/profile-verification.service';
import { ProfileVerificationController } from './profile-verification.controller';

@Module({
  controllers: [ProfileVerificationController],
  providers: [ProfileVerificationService],
})
export class ProfileVerificationModule {}
