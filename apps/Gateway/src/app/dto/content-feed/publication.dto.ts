import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicationDto {
  @Field()
  publicationId: string;

  @Field()
  userId: string;

  @Field()
  login: string;

  @Field()
  avatarUrl: string;

  @Field()
  publicationName: string;

  @Field()
  coverUrl: string;

  @Field()
  type: string;
}
