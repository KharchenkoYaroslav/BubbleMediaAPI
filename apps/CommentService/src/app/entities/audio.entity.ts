import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('audios')
export class Audio {
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
  audioUrl: string;

  @Column()
  coverUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
