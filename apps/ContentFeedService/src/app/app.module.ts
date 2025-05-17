import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';
import { typeOrmConfig } from './config/typeorm.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Photo, Video, Audio]),
    ClientsModule.register([
      {
        name: 'PROFILE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'profile',
          protoPath: join(__dirname, 'proto/profile.proto'),
          url: `${process.env.PROFILE_SERVICE_URL || '0.0.0.0:3003'}`,
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
          url: `${process.env.METRICS_SERVICE_URL || '0.0.0.0:3005'}`,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'proto/auth.proto'),
          url: `${process.env.AUTH_SERVICE_URL || '0.0.0.0:3001'}`,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
