import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetAllVenueService } from './services/get-all-venue.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetVenuesDto } from './dto/getVenue.dto';

@ApiTags('admin')
@Controller('admin/venue')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@Roles("ADMIN")
export class VenueController {
    constructor(
        private readonly getAllVenueService: GetAllVenueService
    ) {}

    @Get("all")
    getAllVenues(@Query() rawData: GetVenuesDto) {
        return this.getAllVenueService.getAllVenues(rawData);
    }
}
