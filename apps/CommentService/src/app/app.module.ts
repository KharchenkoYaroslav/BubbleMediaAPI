import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { Comment } from './entities/comment.entity';
import { Photo } from './entities/photo.entity';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
      ScheduleModule.forRoot(),
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot(typeOrmConfig),
      TypeOrmModule.forFeature([Comment, Photo, Video, Audio]),
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
