import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/venueCreate.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateVenueDto } from './dto/updateVenue.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { FilterService } from './filter.service';
import { FilterVenuesDto } from './dto/filterVenue.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';

@Controller('venue')
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
    private readonly filterService: FilterService,
  ) {}

  @Post('create')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('arrangementsImage'))
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  createVenue(
    @Body() createVenueDto: CreateVenueDto,
    @UploadedFile() arrangementsImage: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = {
      ...createVenueDto,
      arrangementsImage,
    };

    return this.venueService.createVenue({ id: req.user.sub }, data);
  }

  @Patch('update/:id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('arrangementsImage'))
  @ApiBearerAuth()
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  updateVenue(
    @Param() id: IdDto,
    @Body() updateVenueDto: UpdateVenueDto,
    @UploadedFile() arrangementsImage?: Express.Multer.File,
  ) {
    const data = {
      ...updateVenueDto,
      arrangementsImage,
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
}
