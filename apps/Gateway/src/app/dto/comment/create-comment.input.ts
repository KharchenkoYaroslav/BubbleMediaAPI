import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field()
  publicationId: string;

  @Field()
  comment: string;
}
