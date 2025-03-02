import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ReportSection } from './report-section.entity';

@Entity('report_metrics')
export class ReportMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportSection, section => section.metrics)
  section: ReportSection;

  @Column({ length: 100 })
  metric_name: string;

  @Column({ length: 100 })
  metric_friendly_name: string;

  @Column({ length: 50 })
  value: string;

  @Column({ length: 50, nullable: true })
  unit: string;

  @Column({ length: 50, nullable: true })
  reference_min: string;

  @Column({ length: 50, nullable: true })
  reference_max: string;

  @Column('text', { nullable: true })
  medical_terminology: string;

  @Column('text', { nullable: true })
  friendly_interpretation: string;

  @Column({ length: 20, nullable: true })
  status: string; // e.g., "Normal", "Low", "High"

  @Column('text', { nullable: true })
  suggestions: string;

  @Column('text', { nullable: true })
  motivational_message: string;
}
