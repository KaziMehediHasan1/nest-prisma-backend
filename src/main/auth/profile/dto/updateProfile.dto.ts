import { PartialType } from "@nestjs/swagger";
import { SetupPlannerProfileDto, SetupServiceProviderProfileDto, SetupVenueOwnerProfileDto } from "./setupProflie.dto";

export class UpdatePlannerProfile extends PartialType(SetupPlannerProfileDto) {}
export class UpdateServiceProviderProfile extends PartialType(SetupServiceProviderProfileDto) {}
export class UpdateVenueOwnerProfile extends PartialType(SetupVenueOwnerProfileDto) {}