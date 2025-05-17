import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TopPostDto {
  @Field()
  publicationId: string;

  @Field(() => Int)
  score: number;
}
