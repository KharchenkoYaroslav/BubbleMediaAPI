import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveSubscriptionInput {
  @Field()
  subscriptionToRemove: string;
}
