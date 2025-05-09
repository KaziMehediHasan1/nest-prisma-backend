import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { IdDto } from 'src/common/dto/id.dto';
import { CreateAminityDto } from './dto/create-aminity.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';

@Controller('amenities')
@UseGuards(AuthGuard('jwt'), VerifiedGuard)
@ApiBearerAuth()
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get('get-all-amenities')
  getAllAmenities(@Req() req: AuthenticatedRequest) {
    return this.amenitiesService.getAllAmenities({
      id: req.user.profileId || "",
    });
  }

  @Get('get-amenity-by-id/:id')
  getAmenityById(@Param() id: IdDto) {
    return this.amenitiesService.getAmenityById(id);
  }

  @Post('create-amenity')
  createAmenity(@Req() req: AuthenticatedRequest, @Body() data: CreateAminityDto) {
    if (!req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.amenitiesService.createAmenity({ id: req.user.profileId || "" },data);
  }

  @Delete('delete-amenity')
  deleteAmenity(id: IdDto) {
    return this.amenitiesService.deleteAmenity(id);
  }

}
