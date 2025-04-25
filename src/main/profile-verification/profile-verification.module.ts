import { Module } from '@nestjs/common';
import { ProfileVerificationService } from './profile-verification.service';
import { ProfileVerificationController } from './profile-verification.controller';

@Module({
  controllers: [ProfileVerificationController],
  providers: [ProfileVerificationService],
})
export class ProfileVerificationModule {}
