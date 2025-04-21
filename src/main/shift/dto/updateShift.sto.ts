import { PartialType } from '@nestjs/swagger';
import { CreateShiftDto } from './createShift.dto';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}
