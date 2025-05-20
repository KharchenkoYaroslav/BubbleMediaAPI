import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { PublicationsResponseDto } from '../dto/content-feed/publications.response.dto';
import { GetRecentTopPostsInput } from '../dto/content-feed/get-recent-top-posts.input';
import { GetLikedPublicationsInput } from '../dto/content-feed/get-liked-publications.input';
import { GetRandomPublicationsInput } from '../dto/content-feed/get-random-publications.input';
import { GetSubscriptionsPublicationsInput } from '../dto/content-feed/get-subscriptions-publications.input';
import { GetUserPublicationsInput } from '../dto/content-feed/get-user-publications.input';
import { GetIdResponse } from '../dto/auth/get-id.response';

interface ContentFeedServiceGrpc {
  GetUserPublications(
    data: GetUserPublicationsInput & { userId: string }
  ): Observable<PublicationsResponseDto>;
  GetRecentTopPosts(
    data: GetRecentTopPostsInput
  ): Observable<PublicationsResponseDto>;
  GetLikedPublications(
    data: GetLikedPublicationsInput & { userId: string }
  ): Observable<PublicationsResponseDto>;
  GetRandomPublications(
    data: GetRandomPublicationsInput
  ): Observable<PublicationsResponseDto>;
  GetSubscriptionsPublications(
    data: GetSubscriptionsPublicationsInput & { userId: string }
  ): Observable<PublicationsResponseDto>;
}

interface AuthServiceGrpc {
  getId(data: { login: string }): Observable<GetIdResponse>;
}

@Resolver()
export class ContentFeedResolver {
  private contentFeedService: ContentFeedServiceGrpc;
  private authService: AuthServiceGrpc;

  constructor(
    @Inject('CONTENT_FEED_PACKAGE') private client: ClientGrpc,
    @Inject('AUTH_PACKAGE') private authClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.contentFeedService =
      this.client.getService<ContentFeedServiceGrpc>('ContentFeedService');
    this.authService =
      this.authClient.getService<AuthServiceGrpc>('AuthService');
  }

  @Query(() => PublicationsResponseDto)
  async GetUserPublications(
    @Args('input') input: GetUserPublicationsInput
  ): Promise<PublicationsResponseDto> {
    return firstValueFrom(
      this.contentFeedService.GetUserPublications(input)
    );
  }

  @Query(() => PublicationsResponseDto)
  async GetRecentTopPosts(
    @Args('input') input: GetRecentTopPostsInput
  ): Promise<PublicationsResponseDto> {
    if (input.author) {
      const { author, ...rest } = input;
      const authorIdResponse = await firstValueFrom(
        this.authService.getId({ login: author })
      );
      const serviceInput = { ...rest, authorId: authorIdResponse.userId };
      return firstValueFrom(
        this.contentFeedService.GetRecentTopPosts(serviceInput)
      );
    }
    return firstValueFrom(this.contentFeedService.GetRecentTopPosts(input));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => PublicationsResponseDto)
  async GetLikedPublications(
    @Args('input') input: GetLikedPublicationsInput,
    @Context() context
  ): Promise<PublicationsResponseDto> {
    const userId = context.req.user.sub;

    if (input.author) {
      const { author, ...rest } = input;
      const authorIdResponse = await firstValueFrom(
        this.authService.getId({ login: author })
      );
      const serviceInput = {
        ...rest,
        userId,
        authorId: authorIdResponse.userId,
      };
      return firstValueFrom(
        this.contentFeedService.GetLikedPublications(serviceInput)
      );
    }
    return firstValueFrom(
      this.contentFeedService.GetLikedPublications({ ...input, userId })
    );
  }

  @Query(() => PublicationsResponseDto)
  async GetRandomPublications(
    @Args('input') input: GetRandomPublicationsInput
  ): Promise<PublicationsResponseDto> {
    if (input.author) {
      const { author, ...rest } = input;
      const authorIdResponse = await firstValueFrom(
        this.authService.getId({ login: author })
      );
      const serviceInput = { ...rest, authorId: authorIdResponse.userId };
      return firstValueFrom(
        this.contentFeedService.GetRandomPublications(serviceInput)
      );
    }
    return firstValueFrom(this.contentFeedService.GetRandomPublications(input));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => PublicationsResponseDto)
  async GetSubscriptionsPublications(
    @Args('input') input: GetSubscriptionsPublicationsInput,
    @Context() context
  ): Promise<PublicationsResponseDto> {
    const userId = context.req.user.sub;
    if (input.author) {
      const { author, ...rest } = input;
      const authorIdResponse = await firstValueFrom(
        this.authService.getId({ login: author })
      );
      const serviceInput = {
        ...rest,
        userId,
        authorId: authorIdResponse.userId,
      };
      return firstValueFrom(
        this.contentFeedService.GetSubscriptionsPublications(serviceInput)
      );
    }
    return firstValueFrom(
      this.contentFeedService.GetSubscriptionsPublications({ ...input, userId })
    );
  }
}
