import { Field, InputType } from '@nestjs/graphql';
import { PostsRequestDto } from './posts.request.dto';

@InputType()
export class GetLikedPublicationsInput {
  @Field(() => PostsRequestDto)
  postsRequest: PostsRequestDto;

  @Field(() => [String], { nullable: true })
  tegs?: string[];

  @Field(() => String, { nullable: true })
  author?: string;
}
