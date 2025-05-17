import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ContentService', 'GetVideo')
  async getVideo(data: { publicationId: string }) {
    return this.appService.getVideo(data.publicationId);
  }

  @GrpcMethod('ContentService', 'GetAudio')
  getAudio(data: { publicationId: string }) {
    return this.appService.getAudio(data.publicationId);
  }

  @GrpcMethod('ContentService', 'GetPhoto')
  getPhoto(data: { publicationId: string }) {
    return this.appService.getPhoto(data.publicationId);
  }

  @GrpcMethod('ContentService', 'UploadVideo')
  async uploadVideo(
    data: {
      userId: string;
      publicationName: string;
      about: string;
      tegs: string[];
      videoBuffer: Buffer;
      coverBuffer: Buffer;
      videoMimeType: string;
      coverMimeType: string;
    }
  ) {
    await this.appService.uploadVideo(
      data.userId,
      data.publicationName,
      data.about,
      data.tegs,
      data.videoBuffer,
      data.coverBuffer,
      data.videoMimeType,
      data.coverMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'UploadAudio')
  async uploadAudio(
    data: {
      userId: string;
      publicationName: string;
      about: string;
      tegs: string[];
      audioBuffer: Buffer;
      coverBuffer: Buffer;
      audioMimeType: string;
      coverMimeType: string;
    }
  ) {
    await this.appService.uploadAudio(
      data.userId,
      data.publicationName,
      data.about,
      data.tegs,
      data.audioBuffer,
      data.coverBuffer,
      data.audioMimeType,
      data.coverMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'UploadPhoto')
  async uploadPhoto(
    data: {
      userId: string;
      publicationName: string;
      about: string;
      tegs: string[];
      photoBuffer: Buffer;
      photoMimeType: string;
    }
  ) {
    await this.appService.uploadPhoto(
      data.userId,
      data.publicationName,
      data.about,
      data.tegs,
      data.photoBuffer,
      data.photoMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'ChangeVideo')
  async changeVideo(
    data: {
      userId: string;
      publicationId: string;
      publicationName?: string;
      about?: string;
      tegs?: string[];
      videoBuffer?: Buffer;
      coverBuffer?: Buffer;
      videoMimeType?: string;
      coverMimeType?: string;
    }
  ) {
    await this.appService.changeVideo(
      data.userId,
      data.publicationId,
      data.publicationName,
      data.about,
      data.tegs,
      data.videoBuffer,
      data.coverBuffer,
      data.videoMimeType,
      data.coverMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'ChangeAudio')
  async changeAudio(
    data: {
      userId: string;
      publicationId: string;
      publicationName?: string;
      about?: string;
      tegs?: string[];
      audioBuffer?: Buffer;
      coverBuffer?: Buffer;
      audioMimeType?: string;
      coverMimeType?: string;
    }
  ) {
    await this.appService.changeAudio(
      data.userId,
      data.publicationId,
      data.publicationName,
      data.about,
      data.tegs,
      data.audioBuffer,
      data.coverBuffer,
      data.audioMimeType,
      data.coverMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'ChangePhoto')
  async changePhoto(
    data: {
      userId: string;
      publicationId: string;
      publicationName?: string;
      about?: string;
      tegs?: string[];
      photoBuffer?: Buffer;
      photoMimeType?: string;
    }
  ) {
    await this.appService.changePhoto(
      data.userId,
      data.publicationId,
      data.publicationName,
      data.about,
      data.tegs,
      data.photoBuffer,
      data.photoMimeType
    );
    return { success: true };
  }

  @GrpcMethod('ContentService', 'DeleteVideo')
  async deleteVideo(data: { publicationId: string, userId: string }) {
    await this.appService.deleteVideo(data.publicationId, data.userId);
    return { success: true };
  }

  @GrpcMethod('ContentService', 'DeleteAudio')
  async deleteAudio(data: { publicationId: string, userId: string }) {
    await this.appService.deleteAudio(data.publicationId, data.userId);
    return { success: true };
  }

  @GrpcMethod('ContentService', 'DeletePhoto')
  async deletePhoto(data: { publicationId: string, userId: string }) {
    await this.appService.deletePhoto(data.publicationId, data.userId);
    return { success: true };
  }

  @MessagePattern('delete_user_content')
  async deleteUserContent(userId: string) {

    await this.appService.deleteUserContent(userId);
    return { success: true };
  }
}
