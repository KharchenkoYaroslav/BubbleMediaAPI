import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RegisterResponse {
  @Field()
  login: string;

  @Field()
  createdAt: string;
}
