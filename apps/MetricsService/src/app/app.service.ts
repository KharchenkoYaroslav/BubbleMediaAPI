import { Injectable} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from './redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikedPublication } from './entities/liked-publication.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(LikedPublication)
    private readonly likedPublicationRepository: Repository<LikedPublication>
  ) {}

  async addPublication(publicationId: string, userId: string): Promise<void> {
    await this.redisService.addPublication(publicationId, userId);
  }

  async removePublication(publicationId: string, userId: string): Promise<void> {
    await this.likedPublicationRepository.delete({ publicationId });
    await this.redisService.removePublication(publicationId, userId);
  }

  async removeUser(userId: string): Promise<void> {
    await this.likedPublicationRepository.delete({ userId });
    await this.redisService.removeUser(userId);
  }

  async getTotalLikes(publicationId: string): Promise<number> {
    return this.redisService.getTotalLikes(publicationId);
  }

  async addLike(publicationId: string, userId: string): Promise<void> {
    const likedPublication = await this.likedPublicationRepository.findOne({
      where: { publicationId, userId },
    });

    if (!likedPublication) {
      const newLikedPublication = this.likedPublicationRepository.create({
        publicationId,
        userId,
      });
      await this.likedPublicationRepository.save(newLikedPublication);
      await this.redisService.addLike(publicationId);
    }
  }

  async removeLike(publicationId: string, userId: string): Promise<void> {
    const likedPublication = await this.likedPublicationRepository.findOne({
      where: { publicationId, userId },
    });

    if (likedPublication) {
      await this.likedPublicationRepository.remove(likedPublication);
      await this.redisService.removeLike(publicationId);
    }
  }

  async getLikedPublications(userId: string): Promise<string[]> {
    const publications = await this.likedPublicationRepository.find({ where: { userId } });
    return publications.map((publication) => publication.publicationId);
  }

  async getRecentTopPosts(): Promise<{ publicationId: string; score: number }[]> {
    const result = await this.redisService.getRecentTopPosts();
    return result;
  }

  @Cron('0 1 * * *')
  async cleanupOldDays(): Promise<void> {
      await this.redisService.cleanupOldDays();
    }

}
