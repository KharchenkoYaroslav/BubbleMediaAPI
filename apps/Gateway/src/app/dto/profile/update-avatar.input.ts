import { Field, InputType } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateAvatarInput {
  @Field(() => GraphQLUpload)
  file: FileUpload;
}
