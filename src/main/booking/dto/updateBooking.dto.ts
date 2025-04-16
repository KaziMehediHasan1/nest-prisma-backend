import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './createBooking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
