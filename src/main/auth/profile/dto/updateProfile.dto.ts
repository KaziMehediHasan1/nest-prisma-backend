import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './setupProflie.dto';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { $Enums } from '@prisma/client';

export class UpdatePlannerProfile {
  @ApiPropertyOptional({
    description: 'User gender',
    enum: $Enums.Gender,
  })
  @IsOptional()
  @IsEnum($Enums.Gender, {
    message: `Gender must be one of: 
    ${$Enums.Gender.MALE}, 
    ${$Enums.Gender.FEMALE}, 
    ${$Enums.Gender.OTHER}`,
  })
  gender?: $Enums.Gender;

  @ApiPropertyOptional({
    description: 'User address',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address cannot be longer than 200 characters' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Array of UUIDs',
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
  @IsOptional()
  @IsArray()
  @ArrayUnique({ message: 'EventPreference IDs must be unique.' })
  @IsUUID('4', {
    each: true,
    message: 'Each amenity ID must be a valid UUID (version 4).',
  })
  eventPreferenceIds?: string[];

  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString({ message: 'User ID must be a string' })
  @IsUUID('4', { message: 'User Id must be a valid uuid V4' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Original name',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot be longer than 200 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'User name',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot be longer than 200 characters' })
  userName?: string;
}
export class UpdateServiceProviderProfile extends PartialType(
  SetupServiceProviderProfileDto,
) {
  @ApiPropertyOptional({
    description: 'User address',
    example: 'Jayed Bin Nazir 253',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  userName: string;
}
export class UpdateVenueOwnerProfile extends PartialType(
  SetupVenueOwnerProfileDto,
) {
  @ApiPropertyOptional({
    description: 'User address',
    example: 'Jayed Bin Nazir 253',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  userName: string;
}
