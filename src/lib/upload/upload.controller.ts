import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { fileURLToPath } from 'url';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('image')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Upload a Image, this is just for testing purpose.'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
                    new FileTypeValidator({ fileType: /(jpeg|png|jpg|gif|webp)$/ }),
                ],
            }),
        ) 
        file: Express.Multer.File,
    ) {
        return this.uploadService.uploadFile({ file });
    }

    @Post('file')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Upload a file. this is just for testing purpose.'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 5MB limit
                ],
            }),
        ) 
        file: Express.Multer.File,
    ) {
        return this.uploadService.uploadFile({ file });
    }
}
