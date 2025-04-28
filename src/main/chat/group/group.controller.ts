import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateManualGroupDto } from './dto/createManulGroup.sto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGroupMessageDto } from './dto/CreateGroupMessage.dto';

@Controller('group')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create manual group',
  })
  async createGroup(
    @Body() rawData: CreateManualGroupDto,
    @UploadedFile() image: Express.Multer.File,
) {
    
    const data = {
      ...rawData,
      image
    }

    return this.groupService.createGroup(data);
  }

    @Post('create-message')
    @ApiConsumes('multipart/form-data', 'application/json')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
      summary: 'Create a new message with video or attachments',
    })
    create(
      @UploadedFile() file: Express.Multer.File,
      @Body() data: CreateGroupMessageDto
  ) {
      const rawData = {
          ...data,
          file,
      }
      return this.groupService.createMessage(rawData);
    }
}
