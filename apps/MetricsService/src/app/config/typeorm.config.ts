import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LikedPublication } from '../entities/liked-publication.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [LikedPublication],
  synchronize: true,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
};
