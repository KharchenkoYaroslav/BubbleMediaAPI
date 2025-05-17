import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PhotoResponse {
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
  photoUrl: string;

  @Field()
  createdAt: Date;
}
