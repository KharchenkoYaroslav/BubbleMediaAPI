import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddSubscriptionInput {
  @Field()
  subscription: string;
}
