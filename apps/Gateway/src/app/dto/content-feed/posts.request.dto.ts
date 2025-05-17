import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PostsRequestDto {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}
