import {
    IsString,
    IsOptional,
    IsInt,
    IsUUID,
    IsArray,
    ArrayNotEmpty,
    ArrayUnique,
    IsEnum,
    IsObject,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  import { Transform, Type } from 'class-transformer';
  import {
    VenueType,
    BookingType,
    TableShape,
    SeatingStyle,
    LightingStyle,
    FlowerColor,
    FlowerType,
    Fragrance,
  } from '@prisma/client';
  
  export class DecorationDto {
    @ApiProperty({ enum: TableShape, isArray: true })
    @IsArray()
    @IsEnum(TableShape, { each: true })
    tableShapes: TableShape[];
  
    @ApiProperty({ enum: SeatingStyle, isArray: true })
    @IsArray()
    @IsEnum(SeatingStyle, { each: true })
    seatingStyles: SeatingStyle[];
  
    @ApiProperty({ enum: LightingStyle, isArray: true })
    @IsArray()
    @IsEnum(LightingStyle, { each: true })
    lighting: LightingStyle[];
  
    @ApiProperty({ enum: FlowerColor, isArray: true })
    @IsArray()
    @IsEnum(FlowerColor, { each: true })
    flowerColors: FlowerColor[];
  
    @ApiProperty({ enum: FlowerType, isArray: true })
    @IsArray()
    @IsEnum(FlowerType, { each: true })
    flowerTypes: FlowerType[];
  
    @ApiProperty({ enum: Fragrance, isArray: true })
    @IsArray()
    @IsEnum(Fragrance, { each: true })
    fragrances: Fragrance[];
  }
  
  export class CreateVenueDto {
    @ApiProperty()
    @IsString()
    name: string;
  
    @ApiProperty()
    @IsString()
    city: string;
  
    @ApiProperty()
    @IsString()
    area: string;
  
    @ApiProperty()
    @IsInt()
    @Transform(({ value }) => parseInt(value, 10))
    capacity: number;
  
    @ApiProperty({ enum: VenueType })
    @IsString()
    type: VenueType;
  
    @ApiProperty({
      description: 'Array of UUIDs (can be JSON or comma-separated)',
      example: ['550e8400-e29b-41d4-a716-446655440000', '1c0ca3ec-0905-40db-9d1d-8c927bd759f7'],
      type: [String],
    })
    @Transform(({ value }) => {
      if (typeof value === 'string') {
        try {
          // Try to parse as JSON string
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // If not JSON, assume comma-separated
          return value.split(',').map((v) => v.trim());
        }
      }
      return value;
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'At least one amenity ID must be provided.' })
    @ArrayUnique({ message: 'Amenity IDs must be unique.' })
    @IsUUID('4', { each: true, message: 'Each amenity ID must be a valid UUID (version 4).' })
    amenityIds: string[];
  
    @ApiProperty({
      type: 'string',
      format: 'binary',
      required: false,
    })
    arrangementsImage: Express.Multer.File;

    @ApiProperty({
      type: 'string',
      format: 'binary',
      required: false,
    })
    venueImage: Express.Multer.File;
  
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cateringDescription?: string;
  
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    parkingDescription?: string;
  
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    availabilityDescription?: string;
  
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    extraServiceDescription?: string;
  
    @ApiProperty()
    @IsInt()
    @Transform(({ value }) => parseInt(value, 10))
    price: number;
  
    @ApiProperty({ enum: BookingType })
    @IsString()
    bookingType: BookingType;
  
    @ApiProperty({
      type: DecorationDto,
      description: 'Decoration preferences as a nested object (JSON string in form-data)',
      example: {
        tableShapes: ['ROUND'],
        seatingStyles: ['BANQUET'],
        lighting: ['AMBIENT'],
        flowerColors: ['WHITE'],
        flowerTypes: ['ROSES'],
        fragrances: ['FLORAL_SCENTS'],
      },
    })
    @Transform(({ value }) => {
      console.log("Before parsing:", value);  // Log incoming value for debugging
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);  // Parse the string into an object
        } catch (error) {
          console.error("Error parsing decoration:", error);
          throw new Error('Invalid decoration JSON');
        }
      }
      return value;
    })
    @IsObject()
    @Type(() => DecorationDto)
    decoration: DecorationDto;
  
    @ApiProperty()
    @IsUUID()
    profileId: string;
  }
  