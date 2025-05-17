import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetProfileResponse {
  @Field()
  about: string;

  @Field()
  avatarUrl: string;

  @Field(() => [String], { nullable: true })
  subscriptions: string[];

  @Field()
  subscribersCount: number;
}
