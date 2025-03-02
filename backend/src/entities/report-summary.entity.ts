import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_summaries')
export class ReportSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Report, report => report.summary)
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column('text', { nullable: true })
  medical_summary: string;

  @Column('text', { nullable: true })
  friendly_summary: string;

  @Column('text', { nullable: true })
  ai_diagnosis_summary: string;
}
