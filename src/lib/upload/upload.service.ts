import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbService } from '../db/db.service';
import { FileInstance, FileType } from '@prisma/client';
import { v4 as uuid4 } from "uuid";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client;

    constructor(
        private readonly config: ConfigService,
        private readonly db: DbService
    ) {
        this.s3Client = new S3Client({
            region: this.config.getOrThrow<string>('AWS_REGION'),
            endpoint: this.config.getOrThrow<string>("AWS_ENDPOINT"),
            forcePathStyle: true,
            credentials: {
                accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    private sanitizeFileName(fileName: string): string {
        return fileName.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    }

    private getFileType(mimeType: string): FileType {
        if (mimeType.startsWith('image/')) return FileType.IMAGE;
        if (mimeType.startsWith('video/')) return FileType.VIDEO;
        if (mimeType.startsWith('audio/')) return FileType.AUDIO;
        return FileType.DOCUMENT;
    }

    async uploadFile({
        file,
        userId
    }: {
        file: Express.Multer.File,
        userId?: string
    }): Promise<FileInstance> {
        const bucketName = this.config.getOrThrow<string>('AWS_BUCKET_NAME');
        const sanitizedFileName = this.sanitizeFileName(file.originalname);
        
        const fileId = `${sanitizedFileName}-${uuid4()}`;
        await this.s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: fileId,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        }));

        const fileType = this.getFileType(file.mimetype);

        return this.db.fileInstance.create({
            data: {
                fileId,
                path: await this.getPresignedUrl(fileId, 3600 * 24 * 7),
                bucket: bucketName,
                name: file.originalname,
                expiresAt: new Date(Date.now() + 3600 * 24 * 7 * 1000),
                type: fileType,
            }
        });
    }

    public async getPresignedUrl(fileName: string, expiresIn): Promise<string> {
        const bucketName = this.config.getOrThrow<string>('AWS_BUCKET_NAME');

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        });

        const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
        return signedUrl;
    }

    async deleteFile(Key: string): Promise<void> {
        const bucketName = this.config.getOrThrow<string>('AWS_BUCKET_NAME');

        await this.s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key,
        }));
    }
}
