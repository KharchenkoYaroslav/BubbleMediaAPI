import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'google_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'google',
      protoPath: join(__dirname, 'proto/google.proto'),
      url: `${process.env.GOOGLE_SERVICE_URL || '0.0.0.0:3002'}`,
      maxReceiveMessageLength: 1024 * 1024 * 1024,
    },
  });

  await app.startAllMicroservices();

  Logger.log(
    `🚀 Google service running (gRPC on ${
      process.env.GOOGLE_SERVICE_URL || '0.0.0.0:3002'
  })`
  );
}

bootstrap();
