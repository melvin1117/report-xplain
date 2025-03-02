import {
    Controller,
    Post,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { PostReportService } from '../services/post_report.service';
import { AuthGuard } from '@nestjs/passport'; // or your custom JWT guard
import { Request } from 'express';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: PostReportService) { }

    /**
     * Example endpoint that receives an array of report objects,
     * plus a separate pdfUrl. Adjust as needed if you only expect a single object.
     */
    @UseGuards(AuthGuard('jwt')) // Protect with JWT if needed
    @Post()
    async createReports(
        @Body() reportsData: any[],
        @Query('pdfUrl') pdfUrl: string, // or from Body, or from file upload
        @Req() req: Request,
    ) {
        // If you have user info from JWT, you can get it here (e.g., req.user)
        const user = req.user as { id: number; email: string };

        // If the request only sends a single object, you might do: const [data] = reportsData;
        // For now, let's assume it could be an array of multiple objects.
        const createdReports = [];

        for (const data of reportsData) {
            // Extract only the fields we need for the "reports" table
            const reportDto = {
                name: data.reportName ?? null,
                uploaderId: user?.id ?? null, // or pass from the body if you have a different logic
                reportType: data.reportType ?? null,
                pdfUrl: pdfUrl ?? null,
                overallSuggestions: data.overallSuggestions ?? null,
            };

            // Call the service to create/save the report
            const created = await this.reportsService.createReport(reportDto);
            createdReports.push(created);
        }

        // Return the newly created report(s)
        return createdReports;
    }
}
