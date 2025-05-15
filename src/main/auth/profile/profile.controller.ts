import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { 
  SetupPlannerProfileDto, 
  SetupServiceProviderProfileDto, 
  SetupVenueOwnerProfileDto 
} from './dto/setupProflie.dto';
import { 
  UpdatePlannerProfile, 
  UpdateServiceProviderProfile, 
  UpdateVenueOwnerProfile 
} from './dto/updateProfile.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('planner-setup')
  @ApiConsumes('multipart/form-data', 'application/json')
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
  @ApiConsumes('multipart/form-data', 'application/json')
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
  @ApiConsumes('multipart/form-data', 'application/json')
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

  // New update routes
  @Patch('planner-profile-update/:id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @ApiParam({ name: 'id', description: 'Profile ID to update' })
  updatePlannerProfile(
    @Param() {id}: IdDto,
    @Body() updateProfileDto: UpdatePlannerProfile,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (image) {
      updateProfileDto.image = image;
    }
    return this.profileService.updatePlannerProfile(id, updateProfileDto);
  }

  @Patch('venue-owner-profile-update/:id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @ApiParam({ name: 'id', description: 'Profile ID to update' })
  updateVenueOwnerProfile(
    @Param() {id}: IdDto,
    @Body() updateProfileDto: UpdateVenueOwnerProfile,
    @UploadedFile() image: Express.Multer.File,
  ){
    if (image) {
      updateProfileDto.image = image;
    }
    return this.profileService.updateVenueOwnerProfile(id, updateProfileDto);
  }

  @Patch('service-provider-profile-update/:id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ])
  )
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @ApiParam({ name: 'id', description: 'Profile ID to update' })
  updateServiceProviderProfile(
    @Param() {id}: IdDto,
    @Body() updateProfileDto: UpdateServiceProviderProfile,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
    },
  ){
    if (files?.image?.[0]) {
      updateProfileDto.image = files.image[0];
    }

    if (files?.coverPhoto?.[0]) {
      updateProfileDto.coverPhoto = files.coverPhoto[0];
    }

    return this.profileService.updateServiceProviderProfile(id, updateProfileDto);
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @Get('get-service-provider-profiles')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  getProfiles(
    @Query('search') search?: string,
    @Query('take') take = 10,
    @Query('skip') skip = 0,
  ) {
    return this.profileService.getServiceProviderProfile( {take, skip}, search)
  }
}