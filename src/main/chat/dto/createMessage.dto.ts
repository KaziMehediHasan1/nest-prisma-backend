import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDirectMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  @IsString()
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'ID of the member sending the message',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'memberId must be a valid UUID (version 4).' })
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({
    description: 'ID of the conversation associated with the message',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'conversationId must be a valid UUID (version 4).' })
  @IsNotEmpty()
  conversationId: string;
}
