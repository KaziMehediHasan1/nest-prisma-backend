import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class SwitchRoleDto {

  @ApiPropertyOptional({
    description: 'User role',
    enum: $Enums.UserRole,
    example: 'ADMIN', // Assuming ADMIN is one of the roles
    enumName: 'UserRole',
    required: false,
  })
  @IsOptional({ message: 'User role is required' })
  @IsEnum($Enums.UserRole, { message: 'Invalid user role' })
  role: $Enums.UserRole;
  
}
