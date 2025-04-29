import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { IdDto } from 'src/common/dto/id.dto';
import { CreateAminityDto } from './dto/create-aminity.dto';

@Controller('amenities')
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
  createAmenity(data: CreateAminityDto) {
    return this.amenitiesService.createAmenity(data);
  }

  @Delete('delete-amenity')
  deleteAmenity(id: IdDto) {
    return this.amenitiesService.deleteAmenity(id);
  }

}
