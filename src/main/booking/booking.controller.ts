import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/createBooking.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

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
  @Roles('PLANNER')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @ApiBearerAuth()
  getDecorationEnum() {
    return this.bookingService.sendEnum();
  }
}
