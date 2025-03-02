import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

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
// import { ReportsController } from './controllers/reports.controller';
// import { ReportsService } from './services/reports.service';
import { AuthController } from './controllers/auth_controller';
import { AuthService } from './services/auth.service';

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

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'someSecretKey',
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [
    AppController,
    // ReportsController,
    AuthController,
  ],

  providers: [
    AppService,
    // ReportsService,
    AuthService,
  ],
})
export class AppModule { }
