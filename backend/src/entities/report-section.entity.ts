import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Report } from './report.entity';
import { ReportMetric } from './report-metric.entity';

@Entity('report_sections')
export class ReportSection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, report => report.sections)
  report: Report;

  @Column({ length: 100 })
  section_title: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => ReportMetric, metric => metric.section, { cascade: true })
  metrics: ReportMetric[];
}
