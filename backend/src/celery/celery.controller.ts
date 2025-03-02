import { Controller, Get, Query } from '@nestjs/common';
import { CeleryService } from './celery.service';

@Controller('celery')
export class CeleryController {
  constructor(private readonly celeryService: CeleryService) {}

  // Example endpoint: GET /celery/add?a=2&b=3
  @Get('add')
  async add(@Query('a') a: string, @Query('b') b: string): Promise<{ result: number }> {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const result = await this.celeryService.add(numA, numB);
    return { result };
  }
}
