// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class PdfService {
  constructor(private readonly upload: UploadService) {}

  // src/pdf/utils/template.ts
  generateHtml(dto: {
    coupleName: string;
    date: string;
    message: string;
    signature: string;
    imageUrl?: string;
    width?: number; // optional width in pixels
  }): string {
    const contentWidth = dto.width || 600; // default width = 600px

    return pdftemplated(contentWidth, dto);
  }



  //start here
  
  async generateInvitePdf(dto: CreateInviteDto): Promise<ApiResponse<any>> {
    const html = this.generateHtml(dto);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await await page.pdf({
      path: 'invite.pdf',
      format: 'A4', // Optional: still useful for height fallback
      width: `${dto.width || 600}px`, // Use the dynamic width
      printBackground: true,
    });
    const pdfBuffer = Buffer.from(pdfUint8Array);
    await browser.close();
    const fileInstance = await this.upload.savePdfToS3(pdfBuffer, 'invite');
    return {
      success: true,
      data: {
        pdfUrl: fileInstance.path,
      },
      statusCode: 200,
      message: 'PDF generated successfully',
    };
  }
}
