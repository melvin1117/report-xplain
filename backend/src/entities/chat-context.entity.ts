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
