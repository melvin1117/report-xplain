import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import your entities here
import { User } from './entities/user.entity';
import { Report } from './entities/report.entity';
import { ReportMetadata } from './entities/report-metadata.entity';
import { ReportSummary } from './entities/report-summary.entity';
import { ReportSection } from './entities/report-section.entity';
import { ReportMetric } from './entities/report-metric.entity';
import { ReportChart } from './entities/report-chart.entity';
import { ChatContext } from './entities/chat-context.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Load environment variables from the .env file in the project root.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure TypeORM using environment variables.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'reportdb',
      entities: [
        User,
        Report,
        ReportMetadata,
        ReportSummary,
        ReportSection,
        ReportMetric,
        ReportChart,
        ChatContext,
      ],
      synchronize: true, // NOTE: set to false in production
    }),
    // Optionally, import feature modules with repositories using TypeOrmModule.forFeature(...)
    TypeOrmModule.forFeature([
      User,
      Report,
      ReportMetadata,
      ReportSummary,
      ReportSection,
      ReportMetric,
      ReportChart,
      ChatContext,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
