import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

@Controller('users/:userId/reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    // GET /users/:userId/reports
    @Get()
    async getAllReportsByUser(@Param('userId') userId: string) {
        return this.reportsService.findAllByUser(Number(userId));
    }
}
