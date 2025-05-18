import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
      url: `${process.env.AUTH_SERVICE_URL || '0.0.0.0:3001'}`,
    },
  });

  Logger.log(
    `🚀 Application is running on: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}`
  );
}

bootstrap();
