import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { VenueOwnerProfileService } from './sevices/venueOwnerprofile.service';
import { providerProfileService } from './sevices/providerprofile.service';
import { plannerProfileService } from './sevices/plannerprofile.service';

@Module({
  controllers: [ProfileController],
  providers: [VenueOwnerProfileService,providerProfileService,plannerProfileService, AuthService, JwtService],
})
export class ProfileModule {}
