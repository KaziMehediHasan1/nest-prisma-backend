import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateManualGroupDto } from './dto/createManulGroup.sto';
import { UploadService } from 'src/lib/upload/upload.service';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class GroupService {
    constructor(
        private readonly db: DbService,
        private readonly uploadService: UploadService
    ){}

    public async createGroup(rawData:CreateManualGroupDto):Promise<ApiResponse<any>>{
        const {name, image, profileIds} = rawData
        const fileInstance = await this.uploadService.uploadFile({
            file: image
        })
        
        try {
            const group = await this.db.groupMessage.create({
                data: {
                    name,
                    image: {
                        connect: {
                            id: fileInstance.id
                        }
                    },
                    profiles: {
                        connect: profileIds.map(id => ({id}))
                    }
                }
            })
            return {
                data: group,
                message: 'Group created successfully',
                statusCode: 200,
                success: true
            }
        } catch (error) {
            
            await this.uploadService.deleteFile({
                Key: fileInstance.fileId
            })

            throw new BadRequestException(error)
        }
    }
}
