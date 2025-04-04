import { PartialType } from '@nestjs/swagger';
import { CreateEventPreferenceDto } from './create-event-preference.dto';

export class UpdateEventPreferenceDto extends PartialType(CreateEventPreferenceDto) {}
