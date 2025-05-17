import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'content_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'content',
      protoPath: join(__dirname, 'proto/content.proto'),
      url: `${process.env.CONTENT_SERVICE_URL || '0.0.0.0:3004'}`,
      maxReceiveMessageLength: 1024 * 1024 * 1024,
    },
  });

  await app.startAllMicroservices();
  Logger.log(
    `🚀 Content service running (gRPC on ${
      process.env.CONTENT_SERVICE_URL || '0.0.0.0:3004'
    })`
  );

  app.get(AppService).initGrpc();
}

bootstrap();
