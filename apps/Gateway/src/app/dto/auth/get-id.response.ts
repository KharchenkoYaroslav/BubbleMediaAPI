import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GetIdResponse {
  @Field()
  userId: string;
}
