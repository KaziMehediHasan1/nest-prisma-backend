import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SetupPlannerProfileDto {
  @ApiProperty({
    description: 'User gender',
    example: $Enums.Gender.MALE,
    enum: $Enums.Gender,
    required: false,
  })
  @IsEnum($Enums.Gender, {
    message: 'Gender must be one of: Male, Female, Other, Prefer not to say',
  })
  gender: $Enums.Gender;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Anytown, CA 90210',
  })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address cannot be longer than 200 characters' })
  location: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: 'Array of UUIDs (can be JSON or comma-separated)',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '1c0ca3ec-0905-40db-9d1d-8c927bd759f7',
    ],
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
  @ArrayUnique({ message: 'EventPreference IDs must be unique.' })
  @IsUUID('4', {
    each: true,
    message: 'Each amenity ID must be a valid UUID (version 4).',
  })
  eventPreferenceIds: string[];

  @ApiProperty({
    description: 'User Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Address must be a string' })
  @IsUUID('4', { message: 'User Id must be a valid uuid V4' })
  userId: string;

  @ApiProperty({
    description: 'User address',
    example: 'Jayed Bin Nazir',
  })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot be longer than 200 characters' })
  name: string;
}

export class SetupVenueOwnerProfileDto {
  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Anytown, CA 90210',
  })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address cannot be longer than 200 characters' })
  location: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: 'User Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Address must be a string' })
  @IsUUID('4', { message: 'User Id must be a valid uuid V4' })
  userId: string;

  @ApiProperty({
    description: 'User address',
    example: 'Jayed Bin Nazir',
  })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot be longer than 200 characters' })
  name: string;
}

export class SetupServiceProviderProfileDto {
  @ApiProperty({
    description: 'Array of UUIDs (can be JSON or comma-separated)',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '1c0ca3ec-0905-40db-9d1d-8c927bd759f7',
    ],
    type: [String],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(',').map((v) => v.trim());
      }
    }
    return value;
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one amenity ID must be provided.' })
  @ArrayUnique({ message: 'EventPreference IDs must be unique.' })
  @IsUUID('4', {
    each: true,
    message: 'Each Event Preference ID must be a valid UUID (version 4).',
  })
  eventPreferenceIds: string[];

  @ApiProperty({
    description: 'Role of the service provider',
    enum: $Enums.ServiceProviderRole,
  })
  @IsEnum($Enums.ServiceProviderRole)
  serviceProviderRole: $Enums.ServiceProviderRole;

  @ApiProperty({
    description: 'User DDescription',
    example: '123 Main St, Anytown, CA 90210',
  })
  @IsString({ message: 'Address must be a string' })
  description: string;

  @ApiProperty({
    description: 'Years of experience as a service provider',
    example: 5,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt({ message: 'Year of experience must be an integer' })
  experience: number;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: 'Cover photo image for the profile',
    type: 'string',
    format: 'binary',
  })
  coverPhoto: Express.Multer.File;

  @ApiProperty({
    description: 'User Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Address must be a string' })
  @IsUUID('4', { message: 'User Id must be a valid uuid V4' })
  userId: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Anytown, CA 90210',
  })
  @IsString({ message: 'Address must be a string' })
  location: string;

  @ApiProperty({
    description: 'User address',
    example: 'Jayed Bin Nazir',
  })
  @IsString({ message: 'Name must be a string' })
  name: string;
}
