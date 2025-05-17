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
      queue: 'profile_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'profile',
      protoPath: join(__dirname, 'proto/profile.proto'),
      url: `${process.env.PROFILE_GRPC_URL || '0.0.0.0:3003'}`,
    },
  });

  await app.startAllMicroservices();
  Logger.log(
    `🚀 Profile service running (gRPC on ${process.env.PROFILE_GRPC_URL || '0.0.0.0:3003'})`
  );

  app.get(AppService).initGrpc();
}

bootstrap();

