import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GetLoginResponse {
  @Field()
  login: string;
}
