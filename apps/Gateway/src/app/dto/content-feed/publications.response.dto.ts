import { Field, ObjectType } from '@nestjs/graphql';
import { PublicationDto } from './publication.dto';

@ObjectType()
export class PublicationsResponseDto {
  @Field(() => [PublicationDto])
  publications: PublicationDto[];
}
