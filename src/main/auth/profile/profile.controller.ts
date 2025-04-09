import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { SetupPlannerProfileDto, SetupServiceProviderProfileDto, SetupVenueOwnerProfileDto } from './dto/setupProflie.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('planner-setup')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles("PLANNER")
  plannerSetup(
    @Body() setUpEventProfile: SetupPlannerProfileDto,
    @UploadedFile() image: Express.Multer.File,
  ) {

    setUpEventProfile.image = image

    return this.profileService.setupPlannerProfile(setUpEventProfile)
  }


  @Post('venue-owner-setup')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles("VENUE_OWNER")
  venueOwner(
    @Body() setUpVenueOwnerProfile: SetupVenueOwnerProfileDto,
    @UploadedFile() image: Express.Multer.File,
  ){

    setUpVenueOwnerProfile.image = image

    return this.profileService.setUpVenueOwnerProfile(setUpVenueOwnerProfile)

  }


  @Post('service-provider-setup')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ])
  )
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles("SERVICE_PROVIDER")
  serviceProvider(
    @Body() setUpVenueOwnerProfile: SetupServiceProviderProfileDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
    },
  ){

    if (files?.image?.[0]) {
      setUpVenueOwnerProfile.image = files.image[0];
    }

    if (files?.coverPhoto?.[0]) {
      setUpVenueOwnerProfile.coverPhoto = files.coverPhoto[0];
    }

    return this.profileService.setUpServiceProviderProfile(setUpVenueOwnerProfile);

  }
  
}
