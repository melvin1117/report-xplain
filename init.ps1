# Set the error action to stop on any error
$ErrorActionPreference = "Stop"

# Define the project name
$projectName = "backend"

# Navigate into the project directory
Set-Location $projectName

# Create the entities directory
$entitiesDir = "src\entities"
if (!(Test-Path $entitiesDir)) {
    Write-Host "Creating entities directory at '$entitiesDir'..."
    New-Item -ItemType Directory -Path $entitiesDir
}

# -------------------------------
# Create entity files with content
# -------------------------------

# 1. Create User entity: src/entities/user.entity.ts
Write-Host "Creating User entity..."
@"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Report } from './report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Report, report => report.uploader)
  reports: Report[];
}
"@ | Out-File -Encoding utf8 "$entitiesDir\user.entity.ts"

# 2. Create Report entity: src/entities/report.entity.ts
Write-Host "Creating Report entity..."
@"
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
"@ | Out-File -Encoding utf8 "$entitiesDir\report.entity.ts"

# 3. Create ReportMetadata entity: src/entities/report-metadata.entity.ts
Write-Host "Creating ReportMetadata entity..."
@"
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_metadata')
export class ReportMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Report, report => report.metadata)
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ length: 100, nullable: true })
  patient_name: string;

  @Column({ length: 10, nullable: true })
  age: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 100, nullable: true })
  referred_by: string;

  @Column({ length: 50, nullable: true })
  registration_number: string;

  @Column({ type: 'timestamp', nullable: true })
  registered_on: Date;

  @Column({ type: 'date', nullable: true })
  collected_on: Date;

  @Column({ type: 'date', nullable: true })
  received_on: Date;

  @Column({ type: 'timestamp', nullable: true })
  reported_on: Date;

  @Column({ length: 100, nullable: true })
  lab_name: string;

  @Column({ length: 100, nullable: true })
  lab_incharge: string;

  @Column({ length: 100, nullable: true })
  pathologist: string;

  @Column({ length: 100, nullable: true })
  location: string;
}
"@ | Out-File -Encoding utf8 "$entitiesDir\report-metadata.entity.ts"

# 4. Create ReportSummary entity: src/entities/report-summary.entity.ts
Write-Host "Creating ReportSummary entity..."
@"
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
"@ | Out-File -Encoding utf8 "$entitiesDir\report-summary.entity.ts"

# 5. Create ReportSection entity: src/entities/report-section.entity.ts
Write-Host "Creating ReportSection entity..."
@"
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
"@ | Out-File -Encoding utf8 "$entitiesDir\report-section.entity.ts"

# 6. Create ReportMetric entity: src/entities/report-metric.entity.ts
Write-Host "Creating ReportMetric entity..."
@"
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
"@ | Out-File -Encoding utf8 "$entitiesDir\report-metric.entity.ts"

# 7. Create ReportChart entity: src/entities/report-chart.entity.ts
Write-Host "Creating ReportChart entity..."
@"
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
"@ | Out-File -Encoding utf8 "$entitiesDir\report-chart.entity.ts"

# 8. Create ChatContext entity: src/entities/chat-context.entity.ts
Write-Host "Creating ChatContext entity..."
@"
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Report } from './report.entity';

@Entity('chat_context')
export class ChatContext {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, report => report.chatContexts)
  report: Report;

  @Column({ length: 50 })
  context_id: string;

  @Column('text')
  context_text: string;
}
"@ | Out-File -Encoding utf8 "$entitiesDir\chat-context.entity.ts"

Write-Host "Entity files created successfully in '$entitiesDir'."

# Optionally, you can create a sample ormconfig.json in the project root
Write-Host "Creating ormconfig.json..."
@"
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "your_username",
  "password": "your_password",
  "database": "your_database",
  "entities": ["dist/**/*.entity.js"],
  "synchronize": true
}
"@ | Out-File -Encoding utf8 "ormconfig.json"

Write-Host "NestJS project with TypeORM entities is ready."
