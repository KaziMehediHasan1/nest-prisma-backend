import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GetAllProfilesDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter by user role',
    example: UserRole.SERVICE_PROVIDER,
    required: false
  })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status (true/false as string)',
    example: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}