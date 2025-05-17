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
      queue: 'content_feed_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'contentfeed',
      protoPath: join(__dirname, 'proto/content-feed.proto'),
      url: `${process.env.CONTENT_FEED_GRPC_URL || '0.0.0.0:3007'}`,
    },
  });

  await app.startAllMicroservices();
  Logger.log(
    `🚀 Content feed service running (gRPC on ${process.env.CONTENT_FEED_GRPC_URL || '0.0.0.0:3007'})`
  );

  app.get(AppService).initGrpc();
}

bootstrap();
