import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SwitchRoleDto {
  @ApiProperty({
    description: 'User role',
    enum: $Enums.UserRole,
    example: 'ADMIN', // Assuming ADMIN is one of the roles
    enumName: 'UserRole',
  })
  @IsNotEmpty({ message: 'User role is required' })
  @IsEnum($Enums.UserRole, { message: 'Invalid user role' })
  role: $Enums.UserRole;
}
