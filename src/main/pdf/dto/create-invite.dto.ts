import { IsString, IsOptional, IsUrl, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ example: 'Jhon & Jeni', description: 'Couple name to be shown in the invitation title.' })
  @IsString()
  coupleName: string;

  @ApiProperty({ example: 'September 15, 2028', description: 'Date of the event.' })
  @IsString()
  date: string;

  @ApiProperty({ example: 'We are getting married...', description: 'Main invitation message.' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'Jhon & Jeni', description: 'Signature at the bottom of the invite.' })
  @IsString()
  signature: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'Optional image to show in invite (e.g., couple photo).' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 600, description: 'Width of the invitation in pixels. Defaults to 600px if not provided.' })
  @IsOptional()
  @IsNumber()
  @Min(300)
  width?: number;
}
