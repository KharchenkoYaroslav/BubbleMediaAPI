import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GetLikedPublicationsResponseDto {
  @Field(() => [String])
  publicationId: string[];
}
