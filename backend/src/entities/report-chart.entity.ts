import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_charts')
export class ReportChart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, report => report.charts)
  report: Report;

  @Column({ length: 100 })
  chart_title: string;

  @Column({ length: 50 })
  chart_type: string; // e.g., 'pie', 'bullet'
  
  @Column('text', { nullable: true })
  friendly_description: string;

  @Column('jsonb', { nullable: true })
  chart_data: any;
}
