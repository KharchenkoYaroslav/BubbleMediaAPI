import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class UploadPhotoInput {
  @Field()
  publicationName: string;

  @Field()
  about: string;

  @Field(() => [String])
  tegs: string[];

  @Field(() => GraphQLUpload)
  photo: FileUpload;
}

export class UploadPhotoRequest {
  
  publicationName: string;
  about: string;
  tegs: string[];
  photoBuffer: Buffer;
  photoMimeType: string;
}
