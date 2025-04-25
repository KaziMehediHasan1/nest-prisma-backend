import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateVerificationRequestDto } from './dto/createVerificationRequest.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { ApiResponse } from 'src/interfaces/response';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProfileVerificationService {
    constructor(
        private readonly dbService: DbService,
        private readonly uploadService: UploadService
    ) {}

    async sendVerificationRequest(rawData:CreateVerificationRequestDto):Promise<ApiResponse<any>> {
        const isRequestSent = await this.dbService.verificationSubmission.findFirst({
            where: {
                profile: {
                    id: rawData.profileId
                }
            }
        })

        if(isRequestSent) {
            throw new BadRequestException('Verification request already sent.')
        }

        if(!rawData.idCard || !rawData.tradeLicense) {
            throw new BadRequestException('Please upload both id card and trade license.')
        }

        const [idCard, tradeLicense] = await Promise.all([
            this.uploadService.uploadFile({
                file: rawData.idCard,
            }),
            this.uploadService.uploadFile({
                file: rawData.tradeLicense,
            }),
        ])

        try {
            await this.dbService.verificationSubmission.create({
                data:{
                    profile:{
                        connect:{
                            id: rawData.profileId}
                    },
                    idCard:{
                        connect:{
                            id: idCard.id
                        }
                    },
                    tradeLicense:{
                        connect:{
                            id: tradeLicense.id
                        }
                    },
                    bio: rawData.bio
                },
            })

            return {
                success: true,
                data: null,
                message: 'Verification request sent successfully',
                statusCode: 200
            }
        } catch (error) {
            
            await Promise.all([
                 this.uploadService.deleteFile({
                    Key: idCard.fileId
                }),
                 this.uploadService.deleteFile({
                    Key: tradeLicense.fileId
                })
            ])

            throw new BadRequestException(error)
        }
    }

    async getAllVerificationRequests({}:PaginationDto):Promise<ApiResponse<any>> {
        const submissionsWithPayment = await this.dbService.verificationSubmission.findMany({
            where: {
              payment: {
                isNot: null,
              },
            },
            include: {
              profile: true,
              idCard: true,
              tradeLicense: true,
              payment: true,
            },
          });

        return {
            success: true,
            data: submissionsWithPayment,
            message: 'Verification requests fetched successfully',
            statusCode: 200
        }
    }
}
