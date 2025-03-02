import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ReportMetadata } from './report-metadata.entity';
import { ReportSummary } from './report-summary.entity';
import { ReportSection } from './report-section.entity';
import { ReportChart } from './report-chart.entity';
import { ChatContext } from './chat-context.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @Column({ length: 100 })
  report_type: string;

  @Column({ length: 100 })
  report_name: string;

  @Column('text', { nullable: true })
  pdf_url: string;

  @Column('text', { nullable: true })
  overall_suggestions: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToOne(() => ReportMetadata, metadata => metadata.report, { cascade: true })
  metadata: ReportMetadata;

  @OneToOne(() => ReportSummary, summary => summary.report, { cascade: true })
  summary: ReportSummary;

  @OneToMany(() => ReportSection, section => section.report, { cascade: true })
  sections: ReportSection[];

  @OneToMany(() => ReportChart, chart => chart.report, { cascade: true })
  charts: ReportChart[];

  @OneToMany(() => ChatContext, chat => chat.report, { cascade: true })
  chatContexts: ChatContext[];
}
