import { Module } from '@nestjs/common';
import { CeleryController } from './celery.controller';
import { CeleryService } from './celery.service';

@Module({
  controllers: [CeleryController],
  providers: [CeleryService],
  exports: [CeleryService],
})
export class CeleryModule {}
