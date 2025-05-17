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
      queue: 'comment_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'comment',
      protoPath: join(__dirname, 'proto/comment.proto'),
      url: `${process.env.COMMENT_SERVICE_URL || '0.0.0.0:3006'}`,
    },
  });

  await app.startAllMicroservices();
  Logger.log(
    `🚀 Comment service running (gRPC on ${process.env.COMMENT_SERVICE_URL || '0.0.0.0:3006'})`
  );
}

bootstrap();
