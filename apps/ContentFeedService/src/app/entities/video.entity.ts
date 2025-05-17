import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryColumn('uuid')
  publicationId: string;

  @Column()
  userId: string;

  @Column()
  publicationName: string;

  @Column({ default: '' })
  about: string;

  @Column({ type: 'jsonb', default: [] })
  tegs: string[];

  @Column()
  videoUrl: string;

  @Column()
  coverUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
