import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEmail,
  Matches,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'ID of the venue the employee belongs to',
    example: '8b2c2b1a-3fa4-4d80-9f6e-f5a65df70c12',
  })
  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @ApiProperty({
    description: 'First name of the employee',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the employee',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the employee',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the employee (E.164 format recommended)',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @ApiProperty({
    description: 'Role of the employee (e.g., manager, cleaner, etc.)',
    example: 'Manager',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
