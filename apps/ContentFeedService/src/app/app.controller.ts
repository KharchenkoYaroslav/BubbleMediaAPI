import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PostsRequestDto } from './dto/posts.request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ContentFeedService', 'GetUserPublications')
  async getUserPublications(
    request: {postsRequest: PostsRequestDto, userId: string, tegs?: string[]},
  ){

    const publications = await this.appService.getUserPublications(
      request.postsRequest,
      request.userId,
      request.tegs,
    );
    return {publications};
  }

  @GrpcMethod('ContentFeedService', 'GetRecentTopPosts')
  async getRecentTopPosts(
    request: {postsRequest: PostsRequestDto, tegs?: string[], authorId?: string},
  ){
    const publications = await this.appService.getRecentTopPosts(
      request.postsRequest,
      request.tegs,
      request.authorId,
    );
    return {publications};
  }

  @GrpcMethod('ContentFeedService', 'GetLikedPublications')
  async getLikedPublications(
    request: {postsRequest: PostsRequestDto, userId: string, tegs?: string[], authorId?: string},
  ) {

    const publications = await this.appService.getLikedPublications(
      request.postsRequest,
      request.userId,
      request.tegs,
      request.authorId,
    );
    return {publications};
  }

  @GrpcMethod('ContentFeedService', 'GetRandomPublications')
  async getRandomPublications(
    request: {photoCount: number, videoCount: number, audioCount: number, tegs?: string[], authorId?: string},
  ){
    const publications = await this.appService.getRandomPublications(
      request.photoCount,
      request.videoCount,
      request.audioCount,
      request.tegs,
      request.authorId,
    );
    return {publications};
  }

  @GrpcMethod('ContentFeedService', 'GetSubscriptionsPublications')
  async getSubscriptionsPublications(
    request: {postsRequest: PostsRequestDto, userId: string, tegs?: string[], authorId?: string},
  ){

    const publications = await this.appService.getSubscriptionsPublications(
      request.postsRequest,
      request.userId,
      request.tegs,
      request.authorId,
    );
    return {publications};
  }
}
