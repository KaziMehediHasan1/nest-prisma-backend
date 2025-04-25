import { Controller } from '@nestjs/common';
import { ProfileVerificationService } from './profile-verification.service';

@Controller('profile-verification')
export class ProfileVerificationController {
  constructor(private readonly profileVerificationService: ProfileVerificationService) {}
}
