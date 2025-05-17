import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class UploadAudioInput {
  @Field()
  publicationName: string;

  @Field()
  about: string;

  @Field(() => [String])
  tegs: string[];

  @Field(() => GraphQLUpload)
  audio: FileUpload;

  @Field(() => GraphQLUpload)
  cover: FileUpload;
}

export class UploadAudioRequest {
  publicationName: string;
  about: string;
  tegs: string[];
  audioBuffer: Buffer;
  audioMimeType: string;
  coverBuffer: Buffer;
  coverMimeType: string;
}
