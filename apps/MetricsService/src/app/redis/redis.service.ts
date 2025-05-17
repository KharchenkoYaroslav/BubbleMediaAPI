import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType
  ) {}

  private readonly TOTAL_KEY = (publicationId: string) =>
    `post:${publicationId}:likes:total`;
  private readonly RECENT_KEY = (publicationId: string) =>
    `post:${publicationId}:likes:recent`;
  private readonly USER_PUBLICATIONS_KEY = (userId: string) =>
    `user:${userId}:posts`;

  private getToday(): string {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }

  async addPublication(publicationId: string, userId: string): Promise<void> {
    await this.redisClient
      .multi()
      .sAdd(this.USER_PUBLICATIONS_KEY(userId), publicationId)
      .set(this.TOTAL_KEY(publicationId), '0')
      .zAdd(this.RECENT_KEY(publicationId), [
        { score: 0, value: this.getToday() },
      ])
      .exec();
  }

  async removePublication(
    publicationId: string,
    userId: string
  ): Promise<void> {
    await this.redisClient
      .multi()
      .del(this.TOTAL_KEY(publicationId))
      .del(this.RECENT_KEY(publicationId))
      .sRem(this.USER_PUBLICATIONS_KEY(userId), publicationId)
      .exec();
  }

  async publicationExists(publicationId: string): Promise<boolean> {
    const exists = await this.redisClient.exists(this.TOTAL_KEY(publicationId));
    return exists > 0;
  }

  async addLike(publicationId: string): Promise<void> {
    const exists = await this.publicationExists(publicationId);
    if (!exists) {
      throw new Error(`Publication with ID ${publicationId} does not exist.`);
    }
    const totalKey = this.TOTAL_KEY(publicationId);
    const recentKey = this.RECENT_KEY(publicationId);
    const today = this.getToday();

    await this.redisClient
      .multi()
      .incr(totalKey)
      .zIncrBy(recentKey, 1, today)
      .exec();
  }

  async removeLike(publicationId: string): Promise<void> {
    const exists = await this.publicationExists(publicationId);
    if (!exists) {
      throw new Error(`Publication with ID ${publicationId} does not exist.`);
    }
    const totalKey = this.TOTAL_KEY(publicationId);
    const recentKey = this.RECENT_KEY(publicationId);
    const today = this.getToday();

    await this.redisClient
      .multi()
      .decr(totalKey)
      .zIncrBy(recentKey, -1, today)
      .exec();
  }

  async getTotalLikes(publicationId: string): Promise<number> {
    const result = await this.redisClient.get(this.TOTAL_KEY(publicationId));
    return parseInt(result || '0');
  }

  async getRecentTopPosts(
  ): Promise<{ publicationId: string; score: number }[]> {
    const today = new Date();
    const last7Days: string[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
    }

    const scoreboard = new Map<string, number>();

    const recentKeys = await this.redisClient.keys('post:*:likes:recent');

    for (const key of recentKeys) {
      const publicationIdMatch = key.match(/^post:(.+):likes:recent$/);
      if (!publicationIdMatch) continue;

      const publicationId = publicationIdMatch[1];

      const scores = await this.redisClient.zmScore(key, last7Days);
      const totalRecentLikes = scores.reduce((acc, s) => acc + (s ?? 0), 0);

      if (totalRecentLikes > 0) {
        scoreboard.set(publicationId, totalRecentLikes);
      }
    }

    const sorted = [...scoreboard.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([publicationId, score]) => ({ publicationId, score }));

    return sorted;
  }

  async removeUser(userId: string): Promise<void> {
    const userPostsKey = this.USER_PUBLICATIONS_KEY(userId);
    const publicationIds = await this.redisClient.sMembers(userPostsKey);

    const multi = this.redisClient.multi();

    for (const publicationId of publicationIds) {
      multi.del(this.TOTAL_KEY(publicationId));
      multi.del(this.RECENT_KEY(publicationId));
    }

    multi.del(userPostsKey);

    await multi.exec();
  }

  async cleanupOldDays(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffScore = parseInt(
      cutoff.toISOString().slice(0, 10).replace(/-/g, '')
    );

    const recentKeys = await this.redisClient.keys('post:*:likes:recent');

    const multi = this.redisClient.multi();
    for (const recentKey of recentKeys) {
      multi.zRemRangeByScore(recentKey, cutoffScore, '+inf');
    }
    await multi.exec();
  }
}
