import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Video } from '../entities/video.entity';
import { Audio } from '../entities/audio.entity';
import { Photo } from '../entities/photo.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Video, Audio, Photo],
  synchronize: true,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
};
