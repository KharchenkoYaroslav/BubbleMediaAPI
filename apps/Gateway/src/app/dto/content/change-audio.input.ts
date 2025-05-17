import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class ChangeAudioInput {
  @Field()
  publicationId: string;

  @Field({ nullable: true })
  publicationName?: string;

  @Field({ nullable: true })
  about?: string;

  @Field(() => [String], { nullable: true })
  tegs?: string[];

  @Field(() => GraphQLUpload, { nullable: true })
  audio?: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  cover?: FileUpload;
}

export class ChangeAudioRequest {
  publicationId: string;
  userId: string;
  publicationName?: string;
  about?: string;
  tegs?: string[];
  audioBuffer?: Buffer;
  audioMimeType?: string;
  coverBuffer?: Buffer;
  coverMimeType?: string;
}
