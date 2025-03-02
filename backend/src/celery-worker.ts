import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const celery = require('node-celery');

async function bootstrap() {
  console.log('Celery Worker is starting...');
  // Optionally initialize the NestJS application context if you need dependency injection or config.
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Create a celery client using RabbitMQ credentials
  const client = celery.createClient({
    CELERY_BROKER_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672//',
  });

  // Register the 'add' task handler
  client.register('add', (a: number, b: number, callback: any) => {
    console.log(`Received task: add(${a}, ${b})`);
    const sum = a + b;
    console.log(`Computed sum: ${sum}`);
    callback(null, sum);
  });

  console.log('Celery Worker is running and task "add" is registered.');

  // Keep the process alive
  process.stdin.resume();
}

bootstrap();
