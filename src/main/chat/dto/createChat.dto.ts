import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectChatDto {
  @ApiProperty({
    description: 'UUID of the first chat member (memberOne)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  memberOneId: string;

  @ApiProperty({
    description: 'UUID of the second chat member (memberTwo)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  memberTwoId: string;
}
