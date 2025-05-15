import { PartialType } from "@nestjs/mapped-types";
import { CreateServiceProviderTypeDto } from "./createServiceProviderType.dto";

export class UpdateServiceTypeDto extends PartialType(CreateServiceProviderTypeDto) {}