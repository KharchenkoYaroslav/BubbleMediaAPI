import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class UploadVideoInput {
  @Field()
  publicationName: string;

  @Field()
  about: string;

  @Field(() => [String])
  tegs: string[];

  @Field(() => GraphQLUpload)
  video: FileUpload;

  @Field(() => GraphQLUpload)
  cover: FileUpload;
}

export class UploadVideoRequest {
  publicationName: string;
  about: string;
  tegs: string[];
  videoBuffer: Buffer;
  videoMimeType: string;
  coverBuffer: Buffer;
  coverMimeType: string;
}
