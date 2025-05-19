import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';
import { Photo } from './entities/photo.entity';
import { typeOrmConfig } from './config/typeorm.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Video, Audio, Photo]),
    ClientsModule.register([
      {
        name: 'GOOGLE_DRIVE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'google',
          protoPath: join(__dirname, 'proto/google.proto'),
          url: `${process.env.GOOGLE_DRIVE_SERVICE_URL || '0.0.0.0:4020'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'METRICS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'metrics',
          protoPath: join(__dirname, 'proto/metrics.proto'),
          url: `${process.env.METRICS_SERVICE_URL || '0.0.0.0:4050'}`,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
