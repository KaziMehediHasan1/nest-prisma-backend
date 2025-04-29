import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { EventPreferenceService } from './event-preference.service';
import { CreateEventPreferenceDto } from './dto/create-event-preference.dto';
import { UpdateEventPreferenceDto } from './dto/update-event-preference.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { AuthGuard } from '@nestjs/passport';
import { IdDto } from 'src/common/dto/id.dto';

@Controller('event-preference')
export class EventPreferenceController {
  constructor(
    private readonly eventPreferenceService: EventPreferenceService,
  ) {}

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), VerifiedGuard, RolesGuard)
  @Roles("ADMIN")
  create(
    @Body() createEventPreferenceDto: CreateEventPreferenceDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const data = {
      ...createEventPreferenceDto,
      avatar,
    };

    return this.eventPreferenceService.create(data);
  }

  @Get('get')
  @ApiBearerAuth()
  @Roles('PLANNER')
  @UseGuards(AuthGuard("jwt"), VerifiedGuard)
  findAll() {
    return this.eventPreferenceService.findAll();
  }

  @Get('get/:id')
  findOne(@Param() id: IdDto) {
    return this.eventPreferenceService.findOne(id);
  }

  @Patch('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id') id: string,
    @Body() updateEventPreferenceDto: UpdateEventPreferenceDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    // Merge the file with the DTO if it exists
    if (avatar) {
      updateEventPreferenceDto.avatar = avatar;
    }

    return this.eventPreferenceService.update(id, updateEventPreferenceDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.eventPreferenceService.remove(+id);
  }
}
