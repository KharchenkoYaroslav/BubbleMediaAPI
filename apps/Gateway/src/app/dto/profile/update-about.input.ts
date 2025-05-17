import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAboutInput {
  @Field()
  about: string;
}
