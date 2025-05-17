import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('liked_publications')
export class LikedPublication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicationId: string;

  @Column()
  userId: string;
}
