import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(graphqlUploadExpress({ maxFileSize: 1073741824, maxFiles: 2 }));
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });
  const url = process.env.GATEWAY_URL || 'http://localhost:3000';
  await app.listen(process.env.PORT || 4000);
  Logger.log(
    `🚀 Application is running on: ${url}/graphql`
  );
}

bootstrap();
