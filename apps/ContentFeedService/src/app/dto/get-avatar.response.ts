import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetAvatarResponse {
  @Field()
  avatarUrl: string;
}
