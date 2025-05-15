import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/venueCreate.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateVenueDto } from './dto/updateVenue.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { FilterService } from './filter.service';
import { FilterVenuesDto } from './dto/filterVenue.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { HomeService } from './home.service';

@Controller('venue')
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
    private readonly filterService: FilterService,
    private readonly homeService: HomeService,
  ) {}

  @Post('create')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'arrangementsImage', maxCount: 1 },
      { name: 'venueImage', maxCount: 1 },
    ]),
  )
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  createVenue(
    @Body() createVenueDto: CreateVenueDto,
    @UploadedFiles()
    files: {
      arrangementsImage: Express.Multer.File[];
      venueImage: Express.Multer.File[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const data = {
      ...createVenueDto,
      arrangementsImage: files.arrangementsImage?.[0],
      venueImage: files.venueImage?.[0],
    };

    return this.venueService.createVenue({ id: req.user.sub }, data);
  }

  @Patch('update/:id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'arrangementsImage', maxCount: 1 },
      { name: 'venueImage', maxCount: 1 },
    ]),
  )
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  updateVenue(
    @Param() id: IdDto,
    @Body() updateVenueDto: UpdateVenueDto,
    @UploadedFiles()
    files: {
      arrangementsImage?: Express.Multer.File[];
      venueImage?: Express.Multer.File[];
    },
  ) {
    const data = {
      ...updateVenueDto,
      arrangementsImage: files?.arrangementsImage?.[0],
      venueImage: files?.venueImage?.[0],
    };

    return this.venueService.updateVenue(id, data);
  }

  @Get('get/:id')
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  getByID(@Param() id: IdDto) {
    return this.venueService.getVenueById(id);
  }

  @Delete('delete/:id')
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  deleteVenue(@Param() id: IdDto) {
    return this.venueService.deleteVenue(id);
  }

  @Get('filter')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  filter(@Query() filter: FilterVenuesDto) {
    return this.filterService.FilterVenues(filter);
  }

  @Get('get-all-by-venue-owner')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  getAll(@Req() req: AuthenticatedRequest, @Query() pagination:PaginationDto ) {
    if (req.user.profileId) {
      return this.venueService.getAllVenuesByVenueOwner({
        profileId: { id: req.user.profileId },
        pagination
      });
    }
    throw new NotFoundException('Profile not found');
  }

  @Get('planner-home')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles("PLANNER")
  getPlannerHome(@Req() req: AuthenticatedRequest) {
    if(!req.user.profileId) throw new NotFoundException('Profile not found');
   return this.homeService.getHomeData(req.user.profileId);
  }

  @Get('venue-owner-home')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('VENUE_OWNER')
  getVenueOwnerHome(@Req() req: AuthenticatedRequest) {
    if(!req.user.profileId) throw new NotFoundException('Profile not found');
   return this.venueService.getOverviewOfVenueOwnerHome(req.user.profileId);
  }

}
