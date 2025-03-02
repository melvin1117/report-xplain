// services/report.service.ts

import { Injectable } from '@nestjs/common'; // If using NestJS
import { InjectRepository } from '@nestjs/typeorm'; // If using NestJS
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Report } from '../entities/report.entity';
import { ReportMetadata } from '../entities/report-metadata.entity';
import { ReportSummary } from '../entities/report-summary.entity';
import { ReportSection } from '../entities/report-section.entity';
import { ReportMetric } from '../entities/report-metric.entity';
import { ReportChart } from '../entities/report-chart.entity';
import { ChatContext } from '../entities/chat-context.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(ReportMetadata)
    private readonly metadataRepository: Repository<ReportMetadata>,

    @InjectRepository(ReportSummary)
    private readonly summariesRepository: Repository<ReportSummary>,

    @InjectRepository(ReportSection)
    private readonly sectionsRepository: Repository<ReportSection>,

    @InjectRepository(ReportMetric)
    private readonly metricsRepository: Repository<ReportMetric>,

    @InjectRepository(ReportChart)
    private readonly chartsRepository: Repository<ReportChart>,

    @InjectRepository(ChatContext)
    private readonly chatContextRepository: Repository<ChatContext>,
  ) {}

  async createReport(json: any, pdfUrl: string, userId: number): Promise<Report> {
    // 1. Extract top-level fields from JSON
    const {
      reportName,
      reportType,
      overallSuggestions,
      metadata,
      summaries,
      sections,
      charts,
      chatContext,
    } = json;

    // 2. Create the main "Report" entity
    const report = new Report();
    report.report_name = reportName;
    report.report_type = reportType;
    report.pdf_url = pdfUrl;
    const uploader = new User();
    uploader.id = userId;
    report.uploader = uploader;
    report.overall_suggestions = overallSuggestions;

    // Save the bare report first to get its ID
    const savedReport = await this.reportRepository.save(report);

    // 3. Insert "report_metadata"
    if (metadata) {
      const meta = new ReportMetadata();
      meta.patient_name = metadata.patientName;
      meta.age = metadata.age;
      meta.gender = metadata.gender;
      meta.referred_by = metadata.referredBy;
      meta.registration_number = metadata.registrationNumber;
      if (metadata.reportDates) {
        meta.registered_on = metadata.reportDates.registeredOn
          ? new Date(metadata.reportDates.registeredOn)
          : null;
        meta.collected_on = metadata.reportDates.collectedOn
          ? new Date(metadata.reportDates.collectedOn)
          : null;
        meta.received_on = metadata.reportDates.receivedOn
          ? new Date(metadata.reportDates.receivedOn)
          : null;
        meta.reported_on = metadata.reportDates.reportedOn
          ? new Date(metadata.reportDates.reportedOn)
          : null;
      }
      if (metadata.labDetails) {
        meta.lab_name = metadata.labDetails.labName;
        meta.lab_incharge = metadata.labDetails.labIncharge;
        meta.pathologist = metadata.labDetails.pathologist;
        meta.location = metadata.labDetails.location;
      }
      meta.report = savedReport;
      await this.metadataRepository.save(meta);
      savedReport.metadata = meta;
    }

    // 4. Insert "report_summaries"
    if (summaries) {
      const sum = new ReportSummary();
      sum.medical_summary = summaries.medicalSummary;
      sum.friendly_summary = summaries.friendlySummary;
      sum.ai_diagnosis_summary = summaries.aiDiagnosisSummary;
      sum.report = savedReport;
      await this.summariesRepository.save(sum);
      savedReport.summary = sum;
    }

    // 5. Insert "report_sections" and nested "report_metrics"
    if (sections && Array.isArray(sections)) {
      for (const s of sections) {
        const sectionEntity = new ReportSection();
        sectionEntity.section_title = s.sectionTitle;
        sectionEntity.description = s.description;
        sectionEntity.report = savedReport;

        const savedSection = await this.sectionsRepository.save(sectionEntity);

        // Insert metrics for this section
        if (s.metrics && Array.isArray(s.metrics)) {
          for (const m of s.metrics) {
            const metricEntity = new ReportMetric();
            metricEntity.metric_name = m.metricName;
            metricEntity.metric_friendly_name = m.metricFriendlyName;
            metricEntity.value = m.value;
            metricEntity.unit = m.unit;
            if (m.referenceRange) {
              metricEntity.reference_min = m.referenceRange.min;
              metricEntity.reference_max = m.referenceRange.max;
            }
            metricEntity.medical_terminology = m.medicalTerminology;
            metricEntity.friendly_interpretation = m.friendlyInterpretation;
            metricEntity.status = m.status;
            metricEntity.suggestions = m.suggestions;
            metricEntity.motivational_message = m.motivationalMessage;
            metricEntity.section = savedSection;

            await this.metricsRepository.save(metricEntity);
          }
        }
      }
    }

    // 6. Insert "report_charts"
    if (charts && Array.isArray(charts)) {
      for (const c of charts) {
        const chartEntity = new ReportChart();
        chartEntity.chart_title = c.chartTitle;
        chartEntity.chart_type = c.chartType;
        chartEntity.chart_data = c.data; // Assuming `data` is an array or object
        chartEntity.friendly_description = c.friendlyDescription;
        chartEntity.report = savedReport;

        await this.chartsRepository.save(chartEntity);
      }
    }

    // 7. Insert "chat_context"
    if (chatContext && Array.isArray(chatContext)) {
      for (const cc of chatContext) {
        const contextEntity = new ChatContext();
        contextEntity.context_id = cc.contextId;
        contextEntity.context_text = cc.contextText;
        contextEntity.report = savedReport;

        await this.chatContextRepository.save(contextEntity);
      }
    }

    // ----------------------------
    // Manually remove circular references
    // ----------------------------
    if (savedReport.metadata) {
      delete savedReport.metadata.report;
    }
    if (savedReport.summary) {
      delete savedReport.summary.report;
    }
    if (savedReport.sections && Array.isArray(savedReport.sections)) {
      savedReport.sections.forEach(section => {
        delete section.report;
        if (section.metrics && Array.isArray(section.metrics)) {
          section.metrics.forEach(metric => delete metric.section);
        }
      });
    }
    if (savedReport.charts && Array.isArray(savedReport.charts)) {
      savedReport.charts.forEach(chart => {
        delete chart.report;
      });
    }
    if (savedReport.chatContexts && Array.isArray(savedReport.chatContexts)) {
      savedReport.chatContexts.forEach(context => {
        delete context.report;
      });
    }

    // Return the fully saved report without circular references
    return savedReport;
  }
}
