import { Injectable } from '@nestjs/common';
const celery = require('node-celery');

@Injectable()
export class CeleryService {
  private client: any;
  
  constructor() {
    // Use the RABBITMQ_URL from environment variables
    this.client = celery.createClient({
      CELERY_BROKER_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672//',
    });
  }

  async add(a: number, b: number): Promise<number> {
    // Wrap the client call in a Promise to await the result.
    return new Promise((resolve, reject) => {
      this.client.call('add', [a, b], (err: any, result: number) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
