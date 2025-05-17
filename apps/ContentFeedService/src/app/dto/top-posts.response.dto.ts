import { Field, ObjectType } from '@nestjs/graphql';
import { TopPostDto } from './top-post.dto';

@ObjectType()
export class TopPostsResponseDto {
  @Field(() => [TopPostDto])
  posts: TopPostDto[];
}
