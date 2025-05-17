import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  publicationId: string;

  @Column()
  userId: string;

  @Column()
  comment: string;
}
