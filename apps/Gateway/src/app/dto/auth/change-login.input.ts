import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangeLoginInput {
  @Field()
  newLogin: string;
}
