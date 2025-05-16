import { Body, Controller, Post, Res } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate invitation PDF' })
  @ApiBody({ type: CreateInviteDto })
  async generatePdf(@Body() dto: CreateInviteDto) {
    return this.pdfService.generateInvitePdf(dto);
  }
}
