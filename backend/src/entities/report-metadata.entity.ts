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
