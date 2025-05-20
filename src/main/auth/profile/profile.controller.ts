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
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './dto/setupProflie.dto';
import {
  UpdatePlannerProfile,
  UpdateServiceProviderProfile,
  UpdateVenueOwnerProfile,
} from './dto/updateProfile.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { plannerProfileService } from './sevices/plannerprofile.service';
import { providerProfileService } from './sevices/providerprofile.service';
import { VenueOwnerProfileService } from './sevices/venueOwnerprofile.service';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly plannerprofileService: plannerProfileService,
    private readonly providerprofileService: providerProfileService,
    private readonly venueownerprofileService: VenueOwnerProfileService,
  ) {}

  @Post('planner-setup')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('PLANNER')
  plannerSetup(
    @Body() setUpEventProfile: SetupPlannerProfileDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user?.sub) {
      throw new UnauthorizedException(
        'User is missing. Authentication required.',
      );
    }
    setUpEventProfile.image = image;

    return this.plannerprofileService.setupPlannerProfile(
      setUpEventProfile,
      req.user?.sub,
    );
  }

  @Post('venue-owner-setup')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('VENUE_OWNER')
  venueOwner(
    @Body() setUpVenueOwnerProfile: SetupVenueOwnerProfileDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    setUpVenueOwnerProfile.image = image;
    if (!req.user?.sub) {
      throw new UnauthorizedException(
        'User is missing. Authentication required.',
      );
    }
    return this.venueownerprofileService.setUpVenueOwnerProfile(
      setUpVenueOwnerProfile,
      req.user?.sub,
    );
  }

  @Post('service-provider-setup')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ]),
  )
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('SERVICE_PROVIDER')
  serviceProvider(
    @Body() setUpVenueOwnerProfile: SetupServiceProviderProfileDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    if (files?.image?.[0]) {
      setUpVenueOwnerProfile.image = files.image[0];
    }

    if (files?.coverPhoto?.[0]) {
      setUpVenueOwnerProfile.coverPhoto = files.coverPhoto[0];
    }

    if (!req.user?.sub) {
      throw new UnauthorizedException(
        'User is missing. Authentication required.',
      );
    }

    return this.providerprofileService.setUpServiceProviderProfile(
      setUpVenueOwnerProfile,
      req.user?.sub,
    );
  }

  // New update routes
  @Patch('planner-profile-update')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  updatePlannerProfile(
    @Body() updateProfileDto: UpdatePlannerProfile,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (image) {
      updateProfileDto.image = image;
    }

    if (!req.user?.sub) {
      throw new UnauthorizedException(
        'User is missing. Authentication required.',
      );
    }
    if (!req.user?.profileId) {
      throw new UnauthorizedException(
        'User profile is missing. Authentication required.',
      );
    }
    return this.plannerprofileService.updatePlannerProfile(
      req.user?.profileId,
      req.user?.sub,
      updateProfileDto,
    );
  }

  @Patch('venue-owner-profile-update')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  updateVenueOwnerProfile(
    @Body() updateProfileDto: UpdateVenueOwnerProfile,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (image) {
      updateProfileDto.image = image;
    }

    if (!req.user?.sub) {
      throw new UnauthorizedException(
        'User is missing. Authentication required.',
      );
    }
    if (!req.user?.profileId) {
      throw new UnauthorizedException(
        'User profile is missing. Authentication required.',
      );
    }
    return this.venueownerprofileService.updateVenueOwnerProfile(
      req.user?.profileId,
      updateProfileDto,
    );
  }

  @Patch('service-provider-profile-update')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ]),
  )
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  updateServiceProviderProfile(
    @Body() updateProfileDto: UpdateServiceProviderProfile,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    if (files?.image?.[0]) {
      updateProfileDto.image = files.image[0];
    }

    if (files?.coverPhoto?.[0]) {
      updateProfileDto.coverPhoto = files.coverPhoto[0];
    }

    if (!req.user?.profileId) {
      throw new UnauthorizedException(
        'User profile is missing. Authentication required.',
      );
    }

    return this.providerprofileService.updateServiceProviderProfile(
      req.user?.profileId,
      updateProfileDto,
    );
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @Get('get-service-provider-profiles')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'id', required: false })
  getProfiles(
    @Query('search') search?: string,
    @Query('take') take = 10,
    @Query('skip') skip = 0,
    @Query('id') id?: string,
  ) {
    return this.providerprofileService.getServiceProviderProfile(
      { take, skip },
      id,
      search,
    );
  }
}
