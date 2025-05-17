import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteContentInput {
  @Field()
  publicationId: string;
}
