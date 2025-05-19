import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { typeOrmConfig } from './config/typeorm.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Profile]),
    ClientsModule.register([
      {
        name: 'GOOGLE_DRIVE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'google',
          protoPath: join(__dirname, 'proto/google.proto'),
          url: `${process.env.GOOGLE_SERVICE_URL || '0.0.0.0:4020'}`,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
