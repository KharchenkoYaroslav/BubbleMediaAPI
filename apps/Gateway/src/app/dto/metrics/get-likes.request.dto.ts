import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetLikesRequestDto {
  @Field()
  publicationId: string;
}
