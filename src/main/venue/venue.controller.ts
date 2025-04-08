import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/venueCreate.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateVenueDto } from './dto/updateVenue.dto';

@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('arrangementsImage'))
  createVenue(
    @Body() createVenueDto: CreateVenueDto,
     @UploadedFile() arrangementsImage: Express.Multer.File,
  ) {
    const data = {
     ...createVenueDto,
      arrangementsImage,
    };
    
    return this.venueService.createVenue(data);
  }

  @Patch('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('arrangementsImage'))
  updateVenue(
    @Param() id:IdDto,
    @Body() updateVenueDto: UpdateVenueDto,
    @UploadedFile() arrangementsImage?: Express.Multer.File,
  ) {
    const data = {
     ...updateVenueDto,
      arrangementsImage,
    };
    
    return this.venueService.updateVenue(id ,data);
  }

  @Get()
  getByID(@Param() id:IdDto){
    return this.venueService.getVenueById(id)
  }

  @Delete('delete/:id')
  deleteVenue(@Param() id:IdDto){
    return this.venueService.deleteVenue(id)
  }

}
