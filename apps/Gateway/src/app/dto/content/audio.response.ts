import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AudioResponse {
  @Field()
  publicationId: string;

  @Field()
  userId: string;

  @Field()
  publicationName: string;

  @Field()
  about: string;

  @Field(() => [String])
  tegs: string[];

  @Field()
  audioUrl: string;

  @Field()
  coverUrl: string;

  @Field()
  createdAt: string;
}
