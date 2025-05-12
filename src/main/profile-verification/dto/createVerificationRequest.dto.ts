import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateVerificationRequestDto {
  @ApiProperty({
    description: 'UUID of the profile to be verified',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty({
    description: 'Id card image',
    type: 'string',
    format: 'binary',
  })
  idCard: Express.Multer.File;

  @ApiProperty({
    description: 'Tread License image',
    type: 'string',
    format: 'binary',
  })
  tradeLicense: Express.Multer.File;

  @ApiProperty({
    description: 'Short bio',
  })
  @IsNotEmpty()
  @IsString()   
  bio: string;
}
