import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetRandomPublicationsInput {
  @Field(() => Int, { nullable: true })
  photoCount?: number;

  @Field(() => Int, { nullable: true })
  videoCount?: number;

  @Field(() => Int, { nullable: true })
  audioCount?: number;

  @Field(() => [String], { nullable: true })
  tegs?: string[];

  @Field(() => String, { nullable: true })
  author?: string;
}
