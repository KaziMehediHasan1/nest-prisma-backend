import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  SetupPlannerProfileDto,
  SetupServiceProviderProfileDto,
  SetupVenueOwnerProfileDto,
} from './setupProflie.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlannerProfile extends PartialType(SetupPlannerProfileDto) {
  @ApiPropertyOptional({
    description: 'User address',
    example: 'Jayed Bin Nazir 253',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  userName: string;
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
