import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GetLikesRequestDto } from '../dto/metrics/get-likes.request.dto';
import { GetLikesResponseDto } from '../dto/metrics/get-likes.response.dto';
import { LikeRequestDto } from '../dto/metrics/like.request.dto';

interface MetricsServiceGrpc{
  getTotalLikes(data: GetLikesRequestDto): Observable<GetLikesResponseDto>;
  addLike(data: LikeRequestDto): Observable<{ success: boolean }>;
  removeLike(data: LikeRequestDto): Observable<{ success: boolean }>;
}

@Resolver()
export class MetricsResolver {
  private metricsService: MetricsServiceGrpc;

  constructor(@Inject('METRICS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.metricsService = this.client.getService<MetricsServiceGrpc>('MetricsService');
  }

  @Query(() => GetLikesResponseDto)
  async getTotalLikes(@Args('data') data: GetLikesRequestDto){
    return await firstValueFrom(this.metricsService.getTotalLikes(data));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async addLike(@Args('data') data: LikeRequestDto, @Context() context){
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.metricsService.addLike(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeLike(@Args('data') data: LikeRequestDto, @Context() context){
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.metricsService.removeLike(grpcData));
    return response.success;
  }
}
