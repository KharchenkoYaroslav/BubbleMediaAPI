import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import * as dotenv from 'dotenv';
import { Photo } from '../entities/photo.entity';
import { Video } from '../entities/video.entity';
import { Audio } from '../entities/audio.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Comment, Photo, Video, Audio],
  synchronize: true,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
};
