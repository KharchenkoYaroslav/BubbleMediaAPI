import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetLikesResponseDto {
  @Field()
  total: number;
}
