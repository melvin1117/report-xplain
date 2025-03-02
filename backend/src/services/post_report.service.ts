import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class PostReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportsRepository: Repository<Report>,
    ) { }

    async createReport(data: {
        name?: string;
        uploaderId?: number;
        reportType?: string;
        pdfUrl?: string;
        overallSuggestions?: string;
    }): Promise<Report> {
        // Create a new Report entity
        const newReport = this.reportsRepository.create({
            name: data.name ?? null,
            uploaderId: data.uploaderId ?? null,
            reportType: data.reportType ?? null,
            pdfUrl: data.pdfUrl ?? null,
            overallSuggestions: data.overallSuggestions ?? null,
            // createdAt/updatedAt handled automatically by TypeORM if using @CreateDateColumn/@UpdateDateColumn
        });

        // Save to the database
        return this.reportsRepository.save(newReport);
    }
}
