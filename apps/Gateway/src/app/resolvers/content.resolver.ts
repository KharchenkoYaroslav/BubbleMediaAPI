import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { VideoResponse } from '../dto/content/video.response';
import { AudioResponse } from '../dto/content/audio.response';
import { PhotoResponse } from '../dto/content/photo.response';
import { UploadVideoInput, UploadVideoRequest } from '../dto/content/upload-video.input';
import { UploadAudioInput, UploadAudioRequest } from '../dto/content/upload-audio.input';
import { UploadPhotoInput, UploadPhotoRequest } from '../dto/content/upload-photo.input';
import { ChangeVideoInput, ChangeVideoRequest} from '../dto/content/change-video.input';
import { ChangeAudioInput, ChangeAudioRequest } from '../dto/content/change-audio.input';
import { ChangePhotoInput, ChangePhotoRequest } from '../dto/content/change-photo.input';
import { DeleteContentInput} from '../dto/content/delete-content.input';

interface ContentServiceGrpc {
  GetVideo(data: {publicationId: string}): Observable<VideoResponse>;
  GetAudio(data: {publicationId: string}): Observable<AudioResponse>;
  GetPhoto(data: {publicationId: string}): Observable<PhotoResponse>;
  UploadVideo(data: UploadVideoRequest & { userId: string }): Observable<{ success: boolean }>;
  UploadAudio(data: UploadAudioRequest & { userId: string }): Observable<{ success: boolean }>;
  UploadPhoto(data: UploadPhotoRequest & { userId: string }): Observable<{ success: boolean }>;
  ChangeVideo(data: ChangeVideoRequest & { userId: string }): Observable<{ success: boolean }>;
  ChangeAudio(data: ChangeAudioRequest & { userId: string }): Observable<{ success: boolean }>;
  ChangePhoto(data: ChangePhotoRequest & { userId: string }): Observable<{ success: boolean }>;
  DeleteVideo(data: DeleteContentInput & { userId: string }): Observable<{ success: boolean }>;
  DeleteAudio(data: DeleteContentInput & { userId: string }): Observable<{ success: boolean }>;
  DeletePhoto(data: DeleteContentInput & { userId: string }): Observable<{ success: boolean }>;
}


@Resolver()
export class ContentResolver {
  private contentService: ContentServiceGrpc;

  constructor(@Inject('CONTENT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.contentService = this.client.getService<ContentServiceGrpc>('ContentService');
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks as Uint8Array[])));
      stream.on('error', reject);
    });
  }

  @Query(() => VideoResponse)
  async getVideo(@Args('getContentByIdInput') publicationId: string): Promise<VideoResponse> {
    const response = await firstValueFrom(this.contentService.GetVideo({ publicationId }));

    return response;
  }

  @Query(() => AudioResponse)
  async getAudio(@Args('getContentByIdInput') publicationId: string): Promise<AudioResponse> {
    const response = await firstValueFrom(this.contentService.GetAudio({ publicationId }));

    return response;
  }

  @Query(() => PhotoResponse)
  async getPhoto(@Args('getContentByIdInput') publicationId: string): Promise<PhotoResponse> {
    const response = await firstValueFrom(this.contentService.GetPhoto({ publicationId }));

    return response;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async uploadVideo(@Args('uploadVideoInput') data: UploadVideoInput, @Context() context) {
    const userId = context.req.user.sub;
    const { video, cover, ...rest } = data;

    const { createReadStream: videoCreateReadStream, mimetype: videoMimeType } = await video;
    const videoBuffer = await this.streamToBuffer(videoCreateReadStream());

    const { createReadStream: coverCreateReadStream, mimetype: coverMimeType } = await cover;
    const coverBuffer = await this.streamToBuffer(coverCreateReadStream());

    const grpcData = {
      ...rest,
      userId,
      videoBuffer,
      videoMimeType,
      coverBuffer,
      coverMimeType,
    };

    const response = await firstValueFrom(this.contentService.UploadVideo(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async uploadAudio(@Args('uploadAudioInput') data: UploadAudioInput, @Context() context) {
    const userId = context.req.user.sub;
    const { audio, cover, ...rest } = data;

    const { createReadStream: audioCreateReadStream, mimetype: audioMimeType } = await audio;
    const audioBuffer = await this.streamToBuffer(audioCreateReadStream());


    const { createReadStream: coverCreateReadStream, mimetype: coverMimetype } = await cover;
    const coverBuffer = await this.streamToBuffer(coverCreateReadStream());

    const grpcData = {
      ...rest,
      userId,
      audioBuffer,
      audioMimeType,
      coverBuffer,
      coverMimeType: coverMimetype,
    };

    const response = await firstValueFrom(this.contentService.UploadAudio(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async uploadPhoto(@Args('uploadPhotoInput') data: UploadPhotoInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const { photo, ...rest } = data;

    const { createReadStream, mimetype } = await photo;

    const fileBuffer = await this.streamToBuffer(createReadStream());

    const grpcData = {
      ...rest,
      userId,
      photoBuffer: fileBuffer,
      photoMimeType: mimetype,
    };

    const response = await firstValueFrom(this.contentService.UploadPhoto(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changeVideo(@Args('changeVideoInput') data: ChangeVideoInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const { video, cover, publicationId, ...rest } = data;
    const grpcData: ChangeVideoRequest = { publicationId, userId, ...rest };

    if (video) {
      const { createReadStream, mimetype } = await video;
      grpcData.videoBuffer = await this.streamToBuffer(createReadStream());
      grpcData.videoMimeType = mimetype;
    }

    if (cover) {
      const { createReadStream, mimetype } = await cover;
      grpcData.coverBuffer = await this.streamToBuffer(createReadStream());
      grpcData.coverMimeType = mimetype;
    }

    const response = await firstValueFrom(this.contentService.ChangeVideo(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changeAudio(@Args('changeAudioInput') data: ChangeAudioInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const { audio, cover, publicationId, ...rest } = data;
    const grpcData: ChangeAudioRequest = { publicationId, userId, ...rest };

    if (audio) {
      const { createReadStream, mimetype } = await audio;
      grpcData.audioBuffer = await this.streamToBuffer(createReadStream());
      grpcData.audioMimeType = mimetype;
    }

    if (cover) {
      const { createReadStream, mimetype } = await cover;
      grpcData.coverBuffer = await this.streamToBuffer(createReadStream());
      grpcData.coverMimeType = mimetype;
    }

    const response = await firstValueFrom(this.contentService.ChangeAudio(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePhoto(@Args('changePhotoInput') data: ChangePhotoInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const { photo, publicationId, ...rest } = data;
    const grpcData: ChangePhotoRequest = { publicationId, userId, ...rest };

    if (photo) {
      const { createReadStream, mimetype } = await photo;
      grpcData.photoBuffer = await this.streamToBuffer(createReadStream());
      grpcData.photoMimeType = mimetype;
    }

    const response = await firstValueFrom(this.contentService.ChangePhoto(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteVideo(@Args('data') data: DeleteContentInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.contentService.DeleteVideo(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteAudio(@Args('data') data: DeleteContentInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.contentService.DeleteAudio(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePhoto(@Args('data') data: DeleteContentInput, @Context() context): Promise<boolean> {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.contentService.DeletePhoto(grpcData));
    return response.success;
  }
}

