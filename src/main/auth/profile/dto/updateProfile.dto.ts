import { ApiProperty, PartialType } from "@nestjs/swagger";
import { SetupPlannerProfileDto, SetupServiceProviderProfileDto, SetupVenueOwnerProfileDto } from "./setupProflie.dto";
import { IsString, MaxLength } from "class-validator";

export class UpdatePlannerProfile extends PartialType(SetupPlannerProfileDto) {
     @ApiProperty({
        description: 'User address',
        example: 'Jayed Bin Nazir 253',
      })
      @IsString({ message: 'Username must be a string' })
      userName: string;
}
export class UpdateServiceProviderProfile extends PartialType(SetupServiceProviderProfileDto) {
    @ApiProperty({
        description: 'User address',
        example: 'Jayed Bin Nazir 253',
      })
      @IsString({ message: 'Username must be a string' })
      userName: string;
}
export class UpdateVenueOwnerProfile extends PartialType(SetupVenueOwnerProfileDto) {
       @ApiProperty({
        description: 'User address',
        example: 'Jayed Bin Nazir 253',
      })
      @IsString({ message: 'Username must be a string' })
      userName: string;
}