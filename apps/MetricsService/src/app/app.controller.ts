import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('MetricsService', 'AddPublication')
  async addPublication(data: { publicationId: string; userId: string }) {
    await this.appService.addPublication(data.publicationId, data.userId);
    return { success: true };
  }
  @GrpcMethod('MetricsService', 'RemovePublication')
  async removePublication(data: { publicationId: string, userId: string }) {
    await this.appService.removePublication(data.publicationId, data.userId);
    return { success: true };
  }

  @GrpcMethod('MetricsService', 'GetTotalLikes')
  async getTotalLikes(data: { publicationId: string }) {
    const total = await this.appService.getTotalLikes(data.publicationId);
    return { total };
  }

  @GrpcMethod('MetricsService', 'AddLike')
  async addLike(data: { publicationId: string; userId: string }) {
    await this.appService.addLike(data.publicationId, data.userId);
    return { success: true };
  }

  @GrpcMethod('MetricsService', 'RemoveLike')
  async removeLike(data: { publicationId: string; userId: string }) {
    await this.appService.removeLike(data.publicationId, data.userId);
    return { success: true };
  }

  @GrpcMethod('MetricsService', 'GetLikedPublications')
  async getLikedPublications(data: { userId: string }) {
    const likedPublications = await this.appService.getLikedPublications(data.userId);
    return { publicationId: likedPublications };
  }

  @GrpcMethod('MetricsService', 'GetRecentTopPosts')
  async getRecentTopPosts() {
    const posts = await this.appService.getRecentTopPosts();
    return { posts };
  }

  @EventPattern('delete_users_likes')
  async deleteUser(data: { userId: string }) {
    await this.appService.removeUser(data.userId);
  }
}
