import {
  Resolver,
  Mutation,
  Args,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { UseGuards, Inject, OnModuleInit } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CreateCommentInput } from '../dto/comment/create-comment.input';
import { GetPublicationCommentsInput } from '../dto/comment/get-publication-comments.input';
import { Comment } from '../dto/comment/comment.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { PubSub } from 'graphql-subscriptions';

interface CommentServiceGrpc {
  createComment(
    data: CreateCommentInput & { userId: string }
  ): Observable<{ id: string; success: boolean }>;
  PublicationComments(
    data: GetPublicationCommentsInput
  ): Observable<{ comments: Comment[] }>;
}

const pubSub = new PubSub();

@Resolver(() => Comment)
export class CommentResolver implements OnModuleInit {
  private commentService: CommentServiceGrpc;

  constructor(@Inject('COMMENT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.commentService =
      this.client.getService<CommentServiceGrpc>('CommentService');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async createComment(
    @Args('data') data: CreateCommentInput,
    @Context() context
  ) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(
      this.commentService.createComment(grpcData)
    );

    pubSub.publish(`comments:${data.publicationId}`, {
      subscribeToPublicationComments: {
        comment: data.comment,
        id: response.id,
        publicationId: data.publicationId,
        userId,
      },
    });

    return response.success;
  }

  @Subscription(() => Comment, {
    resolve: (payload) => payload.subscribeToPublicationComments,
    filter: (payload, variables) =>
      payload.subscribeToPublicationComments.publicationId ===
      variables.data.publicationId,
  })
  async *subscribeToPublicationComments(
    @Args({ name: 'data', type: () => GetPublicationCommentsInput })
    data: GetPublicationCommentsInput
  ): AsyncGenerator<{ subscribeToPublicationComments: Comment }> {
    const response = await firstValueFrom(
      this.commentService.PublicationComments(data)
    );
    const initialComments: Comment[] = response.comments || [];

    for (const comment of initialComments) {
      yield { subscribeToPublicationComments: comment };
    }

    yield* pubSub.asyncIterableIterator(
      `comments:${data.publicationId}`
    ) as AsyncIterableIterator<{ subscribeToPublicationComments: Comment }>;
  }
}
