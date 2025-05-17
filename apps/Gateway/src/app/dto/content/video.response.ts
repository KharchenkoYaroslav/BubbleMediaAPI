import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VideoResponse {
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
  videoUrl: string;

  @Field()
  coverUrl: string;

  @Field()
  createdAt: Date;
}
