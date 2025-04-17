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
  AcceptanceStatus,
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
      isArray: true,
      enum: TableShape,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(TableShape, { each: true })
    tableShapes: TableShape[];
  
    @ApiProperty({
      description: 'Array of seating styles',
      isArray: true,
      enum: SeatingStyle,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(SeatingStyle, { each: true })
    seatingStyles: SeatingStyle[];
  
    @ApiProperty({
      description: 'Array of lighting styles',
      isArray: true,
      enum: LightingStyle,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(LightingStyle, { each: true })
    lighting: LightingStyle[];
  
    @ApiProperty({
      description: 'Array of flower colors',
      isArray: true,
      enum: FlowerColor,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(FlowerColor, { each: true })
    flowerColors: FlowerColor[];
  
    @ApiProperty({
      description: 'Array of flower types',
      isArray: true,
      enum: FlowerType,
    })
    @IsOptional()
    @IsArray()
    @IsEnum(FlowerType, { each: true })
    flowerTypes?: FlowerType[];
  
    @ApiProperty({
      description: 'Array of fragrances',
      isArray: true,
      enum: Fragrance,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(Fragrance, { each: true })
    fragrances: Fragrance[];
  }
  

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the user who booked', format: 'uuid' })
  @IsUUID('4', { message: 'bookedById must be a valid UUID (version 4).' })
  @IsNotEmpty()
  bookedById: string;

  @ApiPropertyOptional({ description: 'Venue ID (optional)', format: 'uuid' , required: false})
  @IsUUID()
  @IsOptional()
  venueId?: string;

  @ApiPropertyOptional({
    description: 'Service provider ID (optional)',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID()
  serviceProviderId?: string;

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

  @ApiProperty({ description: 'Duration of the event in minutes' })
  @IsInt()
  @Min(0)
  duration: number;

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

  @ApiProperty({ description: 'Total cost of booking' })
  @IsInt()
  @Min(0)
  totalCost: number;

  @ApiProperty({ enum: BookingStatus, description: 'Booking status' })
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;

  @ApiProperty({ description: 'Total amount for the booking', default: 0 })
  @IsInt()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Amount paid', default: 0 })
  @IsInt()
  @Min(0)
  paid: number;

  @ApiProperty({ description: 'Due amount', default: 0 })
  @IsInt()
  @Min(0)
  due: number;

  @ApiProperty({
    enum: AcceptanceStatus,
    description: 'Booking acceptance status',
  })
  @IsEnum(AcceptanceStatus)
  accept: AcceptanceStatus;

  @ApiPropertyOptional({ description: 'Is the event finished?' })
  @IsOptional()
  @IsBoolean()
  isEventFinished?: boolean;
}
