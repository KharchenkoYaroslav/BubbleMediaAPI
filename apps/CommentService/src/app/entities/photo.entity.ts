import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('photos')
export class Photo {
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
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
