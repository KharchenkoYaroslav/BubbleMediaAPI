import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class ChangeVideoInput {
  @Field()
  publicationId: string;

  @Field({ nullable: true })
  publicationName?: string;

  @Field({ nullable: true })
  about?: string;

  @Field(() => [String], { nullable: true })
  tegs?: string[];

  @Field(() => GraphQLUpload, { nullable: true })
  video?: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  cover?: FileUpload;
}

export class ChangeVideoRequest {
  publicationId: string;
  userId: string;
  publicationName?: string;
  about?: string;
  tegs?: string[];
  videoBuffer?: Buffer;
  videoMimeType?: string;
  coverBuffer?: Buffer;
  coverMimeType?: string;
}
