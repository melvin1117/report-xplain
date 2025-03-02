// controllers/report.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from '../services/reportService';
import { MinioService } from 'src/minio/minio.service';

@Controller('reports')
export class ReportController {
  private bucketName = process.env.BUCKET_NAME || 'report-uploads';

  constructor(
    private readonly reportService: ReportService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  async createReport(@Body() body: any) {
    const { json, pdf_url, user_id } = body;
    const numericUserId = parseInt(user_id, 10) || null;
    const newReportId = await this.reportService.createReport(json, pdf_url, numericUserId);
    return {
      success: true,
      data: newReportId,
    };
  }

  // GET all reports for a user: /reports/user/:userId
  @Get('user/:userId')
  async getReportsByUser(@Param('userId') userId: string) {
    const numericUserId = parseInt(userId, 10);
    const reports = await this.reportService.getReportsByUser(numericUserId);
    return { message: 'Reports fetched successfully', data: reports };
  }

  // GET a specific report for a user: /reports/user/:userId/:reportId
  @Get(':reportId/user/:userId')
  async getReportByUser(
    @Param('userId') userId: string,
    @Param('reportId') reportId: string,
  ) {
    const numericUserId = parseInt(userId, 10);
    const numericReportId = parseInt(reportId, 10);
    const report = await this.reportService.getReportByUser(numericUserId, numericReportId);
    return { message: 'Report fetched successfully', data: report };
  }

  // GET PDF for a given report: /reports/download/:reportId
  @Get(':reportId/download')
  async downloadPdf(@Param('reportId') reportId: string, @Res() res: Response) {
    const numericReportId = parseInt(reportId, 10);
    // Fetch the report record to get the pdf_url (i.e., the unique filename)
    const report = await this.reportService.getReportById(numericReportId);
    if (!report || !report.pdf_url) {
      throw new NotFoundException('PDF file not found for this report');
    }
    const fileName = report.pdf_url;
    try {
      // Use MinioService to retrieve the file stream
      const stream = await this.minioService.getFileStream(this.bucketName, fileName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      stream.pipe(res);
    } catch (error) {
      console.error('Error during file download:', error);
      throw new InternalServerErrorException('Error downloading file');
    }
  }
}
