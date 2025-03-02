import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) { }

    // Retrieves all reports for a given user (by userId).
    // By default, `find()` will return all columns defined in the Report entity.
    async findAllByUser(userId: number): Promise<Report[]> {
        return this.reportRepository.find({
            where: { uploader: { id: userId } },
            // If you also want to fetch related entities (metadata, summary, etc.),
            // uncomment or extend the 'relations' array below:
            // relations: ['metadata', 'summary', 'sections', 'charts', 'chatContexts'],
        });
    }
}
