import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GetPublicationCommentsInput {
  @Field()
  publicationId: string;
}
