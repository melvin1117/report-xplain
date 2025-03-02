// controllers/report.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ReportService } from '../services/reportService';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async createReport(@Body() body: any) {
    const { json, pdf_url, user_id } = body;

    // Convert user_id to number if needed
    const numericUserId = parseInt(user_id, 10) || null;

    const newReport = await this.reportService.createReport(json, pdf_url, numericUserId);

    return {
      success: true,
      data: newReport,
    };
  }
}
