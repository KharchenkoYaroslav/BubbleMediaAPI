import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GetLoginInput {
  @Field()
  userId: string;
}
