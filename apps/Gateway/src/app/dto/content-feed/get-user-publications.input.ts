import { Field, InputType } from '@nestjs/graphql';
import { PostsRequestDto } from './posts.request.dto';

@InputType()
export class GetUserPublicationsInput {
  @Field(() => String)
  userId: string;

  @Field(() => PostsRequestDto)
  postsRequest: PostsRequestDto;

  @Field(() => [String], { nullable: true })
  tegs?: string[];
}
