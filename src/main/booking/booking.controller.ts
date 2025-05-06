import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/createBooking.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { IdDto } from 'src/common/dto/id.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { SetPriceDto } from './dto/setPrice.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @Roles('PLANNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get('decoration_enum')
  @Roles('PLANNER',"VENUE_OWNER")
  @ApiOperation({ summary: 'Get decoration enum to create booking' })
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  getDecorationEnum() {
    return this.bookingService.sendEnum();
  }

  @Get('list')
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  getBookingList(@Req() {user}: AuthenticatedRequest) {
    console.log(user);
    
    return this.bookingService.bookingList(user.profileId || "");
  }

  @Get('booked_dates/:id')
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  getBookedDate(@Param() id: IdDto) {
    
    return this.bookingService.getBookedDate(id);
  }
  

  @Get('set-price')
  @Roles('VENUE_OWNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  setPrice(@Body() data: SetPriceDto) {
    
    return this.bookingService.setPrice(data);
  }
}
