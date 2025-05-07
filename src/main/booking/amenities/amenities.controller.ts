import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { IdDto } from 'src/common/dto/id.dto';
import { CreateAminityDto } from './dto/create-aminity.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('amenities')
@UseGuards(AuthGuard('jwt'), VerifiedGuard)
@ApiBearerAuth()
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get('get-all-amenities')
  getAllAmenities() {
    return this.amenitiesService.getAllAmenities();
  }

  @Get('get-amenity-by-id/:id')
  getAmenityById(@Param() id: IdDto) {
    return this.amenitiesService.getAmenityById(id);
  }

  @Post('create-amenity')
  createAmenity(@Body() data: CreateAminityDto) {
    return this.amenitiesService.createAmenity(data);
  }

  @Delete('delete-amenity')
  deleteAmenity(id: IdDto) {
    return this.amenitiesService.deleteAmenity(id);
  }

}
