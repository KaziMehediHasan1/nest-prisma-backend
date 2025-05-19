import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  ArrayNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BookingType,
  BookingStatus,
  TableShape,
  SeatingStyle,
  LightingStyle,
  FlowerColor,
  FlowerType,
  Fragrance,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';

class DecorationDto {
    @ApiProperty({
      description: 'Array of table shapes',
      enum: TableShape,
    })
    @IsEnum(TableShape)
    tableShapes: TableShape;
  
    @ApiProperty({
      description: 'Array of seating styles',
      enum: SeatingStyle,
    })
    @IsEnum(SeatingStyle)
    seatingStyles: SeatingStyle;
  
    @ApiProperty({
      description: 'Array of lighting styles',
      enum: LightingStyle,
    })
    @IsEnum(LightingStyle)
    lighting: LightingStyle;
  
    @ApiProperty({
      description: 'Array of flower colors',
      enum: FlowerColor,
    })
    @IsEnum(FlowerColor)
    flowerColors: FlowerColor;
  
    @ApiProperty({
      description: 'Array of flower types',
      enum: FlowerType,
    })
    @IsEnum(FlowerType)
    flowerTypes: FlowerType;
  
    @ApiProperty({
      description: 'Array of fragrances',
      enum: Fragrance,
    })
    @IsEnum(Fragrance)
    fragrances: Fragrance;
  }
  

// Modified CreateBookingDto for venue-only bookings
export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the user who booked', format: 'uuid' })
  @IsUUID('4', { message: 'bookedById must be a valid UUID (version 4).' })
  @IsNotEmpty()
  bookedById: string;

  @ApiProperty({ description: 'Venue ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ description: 'Event location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Planner name' })
  @IsString()
  @IsNotEmpty()
  plannerName: string;

  @ApiProperty({
    description: 'Selected date of the event',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  selectedDate: Date;

  @ApiProperty({
    description: 'Start time of the event',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    description: 'End time of the event',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  endTime: Date;

  // Duration removed as it will be calculated automatically

  @ApiPropertyOptional({ description: 'Event type ID (UUID)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  eventTypeId?: string;

  @ApiProperty({ enum: BookingType, description: 'Booking type' })
  @IsEnum(BookingType)
  bookingType: BookingType;

  @ApiProperty({ description: 'Number of guests' })
  @IsInt()
  @Min(0)
  guestNumber: number;

  @ApiPropertyOptional({
    description: 'Decoration preferences object (automatically stringified)',
    type: DecorationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DecorationDto)
  @Transform(({ value }) => (value ? JSON.stringify(value) : undefined), {
    toPlainOnly: true,
  })
  decoration?: DecorationDto;

  @ApiProperty({ description: 'Services (array of strings)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services: string[];

  @ApiProperty({ enum: BookingStatus, description: 'Booking status' })
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;

  @ApiPropertyOptional({ description: 'Is the event finished?' })
  @IsOptional()
  @IsBoolean()
  isEventFinished?: boolean;
}