import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LikeRequestDto {
  @Field()
  publicationId: string;
}
