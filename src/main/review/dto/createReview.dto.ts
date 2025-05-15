import {
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EitherVenueOrProfile } from 'src/decorator/either-venue-or-profile.validator';

export class CreateReviewDto {
  @ApiProperty({ example: 4, description: 'Rating (1 to 5 stars)' })
  @IsInt()
  rating: number;

  @ApiPropertyOptional({ example: 'Great venue!', description: 'Optional comment about the experience' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 'venue-uuid-123', description: 'Venue ID (required if profileId is not provided)' })
  @IsOptional()
  @ValidateIf(o => o.venueId !== undefined)
  @IsString()
  @IsNotEmpty()
  venueId?: string;

  @ApiPropertyOptional({ example: 'profile-uuid-456', description: 'Profile ID (required if venueId is not provided)' })
  @IsOptional()
  @ValidateIf(o => o.profileId !== undefined)
  @IsString()
  @IsNotEmpty()
  profileId?: string;

  @Validate(EitherVenueOrProfile, {
    message: 'Either venueId or profileId must be provided, not both or none.',
  })
  dummy?: string;
}