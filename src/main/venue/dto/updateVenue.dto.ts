import { PartialType } from '@nestjs/swagger';
import { CreateVenueDto } from './venueCreate.dto';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
