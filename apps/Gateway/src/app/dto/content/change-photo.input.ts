import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class ChangePhotoInput {
  @Field()
  publicationId: string;

  @Field({ nullable: true })
  publicationName?: string;

  @Field({ nullable: true })
  about?: string;

  @Field(() => [String], { nullable: true })
  tegs?: string[];

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: FileUpload;
}

export class ChangePhotoRequest {
  publicationId: string;
  userId: string;
  publicationName?: string;
  about?: string;
  tegs?: string[];
  photoBuffer?: Buffer;
  photoMimeType?: string;
}
