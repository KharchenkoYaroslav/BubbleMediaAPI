import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryColumn()
  userId: string;

  @Column({ default: '' })
  about: string;

  @Column({ default: 'https://drive.google.com/uc?id=1MvzMkLBQF46-StH8yU7NS8VXndq476f8&export=download' })
  avatarUrl: string;

  @Column({ type: 'jsonb', default: [] })
  subscriptions: string[];
}
