import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';
import { Photo } from './entities/photo.entity';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface GoogleDriveServiceGrpc {
  uploadFile(data: {
    userId: string;
    fileBuffer: Buffer;
    mimeType: string;
  }): Observable<{ success: boolean; publicUrl: string }>;
  deleteFile(data: { fileUrl: string }): Observable<{ success: boolean }>;
}
interface MetricsServiceGrpc {
  addPublication(data: { publicationId: string; userId: string }): Observable<{ success: boolean }>;
  removePublication(data: { publicationId: string; userId: string }): Observable<{ success: boolean }>;
}

@Injectable()
export class AppService {
  private googleDriveService: GoogleDriveServiceGrpc;
  private metricsService: MetricsServiceGrpc;

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @Inject('GOOGLE_DRIVE_PACKAGE')
    private googleClient: ClientGrpc,
    @Inject('METRICS_PACKAGE')
    private metricsClient: ClientGrpc
  ) {}

  public initGrpc(): void {
    this.googleDriveService = this.googleClient.getService<GoogleDriveServiceGrpc>('GoogleDriveService');
    this.metricsService = this.metricsClient.getService<MetricsServiceGrpc>('MetricsService');
  }

  async getVideo(publicationId: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { publicationId },
    });
    if (!video) {
      throw new NotFoundException(`Video with publicationId ${publicationId} not found`);
    }
    return video;
  }

  async getAudio(publicationId: string): Promise<Audio> {
    const audio = await this.audioRepository.findOne({
      where: { publicationId },
    });
    if (!audio) {
      throw new NotFoundException(`Audio with publicationId ${publicationId} not found`);
    }
    return audio;
  }

  async getPhoto(publicationId: string): Promise<Photo> {
    const photo = await this.photoRepository.findOne({
      where: { publicationId },
    });
    if (!photo) {
      throw new NotFoundException(`Photo with publicationId ${publicationId} not found`);
    }
    return photo;
  }

  async uploadVideo(
    userId: string,
    publicationName: string,
    about: string,
    tegs: string[],
    videoBuffer: Buffer,
    coverBuffer: Buffer,
    videoMimeType: string,
    coverMimeType: string,
  ): Promise<void> {
    if (!videoMimeType.startsWith('video/')) {
      throw new Error('Invalid video MIME type');
    }

    if (!coverMimeType.startsWith('image/')) {
      throw new Error('Invalid cover image MIME type');
    }

    const videoUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId, fileBuffer: videoBuffer, mimeType: videoMimeType }));
    if (!videoUploadResult || !videoUploadResult.success) {
      throw new Error('Failed to upload video');
    }
    const videoUrl = videoUploadResult.publicUrl;

    const coverUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId, fileBuffer: coverBuffer, mimeType: coverMimeType }));
    if (!coverUploadResult || !coverUploadResult.success) {
      throw new Error('Failed to upload cover image');
    }
    const coverUrl = coverUploadResult.publicUrl;

    const publicationId = uuidv4();

    const video = this.videoRepository.create({
      publicationId,
      userId,
      publicationName,
      about,
      tegs,
      videoUrl,
      coverUrl,
      createdAt: new Date(),
    });

    if (!await this.videoRepository.save(video)) {
        throw new Error('Failed to save video to database');
    }

    if(!await firstValueFrom(this.metricsService.addPublication({ publicationId: publicationId, userId }))) {
      throw new Error('Failed to add publication to metrics');
    }
  }

  async uploadAudio(
    userId: string,
    publicationName: string,
    about: string,
    tegs: string[],
    audioBuffer: Buffer,
    coverBuffer: Buffer,
    audioMimeType: string,
    coverMimeType: string
  ): Promise<void> {
    if (!audioMimeType.startsWith('audio/')) {
      throw new Error('Invalid audio MIME type');
    }

    if (!coverMimeType.startsWith('image/')) {
      throw new Error('Invalid cover image MIME type');
    }

    const audioUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId, fileBuffer: audioBuffer, mimeType: audioMimeType }));
    if (!audioUploadResult || !audioUploadResult.success) {
      throw new Error('Failed to upload audio');
    }
    const audioUrl = audioUploadResult.publicUrl;

    const coverUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId, fileBuffer: coverBuffer, mimeType: coverMimeType }));
    if (!coverUploadResult || !coverUploadResult.success) {
      throw new Error('Failed to upload cover image');
    }
    const coverUrl = coverUploadResult.publicUrl;

    const publicationId = uuidv4();

    const audio = this.audioRepository.create({
      publicationId,
      userId,
      publicationName,
      about,
      tegs,
      audioUrl,
      coverUrl,
      createdAt: new Date(),
    });

    if (!await this.audioRepository.save(audio)) {
        throw new Error('Failed to save audio to database');
    }

    if(!await firstValueFrom(this.metricsService.addPublication({ publicationId: publicationId, userId }))) {
      throw new Error('Failed to add publication to metrics');
    }
  }

  async uploadPhoto(
    userId: string,
    publicationName: string,
    about: string,
    tegs: string[],
    photoBuffer: Buffer,
    photoMimeType: string
  ): Promise<void> {

    if (!photoMimeType.startsWith('image/')) {
      throw new Error('Invalid photo MIME type');
    }

    const photoUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId, fileBuffer: photoBuffer, mimeType: photoMimeType }));
    if (!photoUploadResult || !photoUploadResult.success) {
      throw new Error('Failed to upload photo');
    }
    const photoUrl = photoUploadResult.publicUrl;

    const publicationId = uuidv4();

    const photo = this.photoRepository.create({
      publicationId,
      userId,
      publicationName,
      about,
      tegs,
      photoUrl,
      createdAt: new Date(),
    });

    if (!await this.photoRepository.save(photo)) {
        throw new Error('Failed to save photo to database');
    }

    if(!await firstValueFrom(this.metricsService.addPublication({ publicationId: publicationId, userId }))) {
      throw new Error('Failed to add publication to metrics');
    }
  }

  async changeVideo(
    userId: string,
    publicationId: string,
    publicationName?: string,
    about?: string,
    tegs?: string[],
    videoBuffer?: Buffer,
    coverBuffer?: Buffer,
    videoMimeType?: string,
    coverMimeType?: string
  ): Promise<void> {
    const video = await this.videoRepository.findOne({
      where: { publicationId, userId },
    });
    if (!video) {
      throw new NotFoundException(`Video with publicationId ${publicationId} not found or does not belong to the user`);
    }

    if (publicationName) {
      video.publicationName = publicationName;
    }
    if (about) {
      video.about = about;
    }
    if (tegs) {
      video.tegs = tegs;
    }

    if (videoBuffer && videoMimeType.startsWith('video/')) {
      try {
        await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: video.videoUrl}));
      } catch (error) {
        throw new Error(`Failed to delete old video file: ${error.message}`);
      }

      const videoUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId: video.userId, fileBuffer: videoBuffer, mimeType: videoMimeType }));
      if (!videoUploadResult || !videoUploadResult.success) {
        throw new Error('Failed to upload video');
      }
      video.videoUrl = videoUploadResult.publicUrl;
    }

    if (coverBuffer && coverMimeType.startsWith('image/')) {
      try {
        await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: video.coverUrl}));
      } catch (error) {
        throw new Error(`Failed to delete old cover image file: ${error.message}`);
      }
      const coverUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId: video.userId, fileBuffer: coverBuffer, mimeType: coverMimeType }));
      if (!coverUploadResult || !coverUploadResult.success) {
        throw new Error('Failed to upload cover image');
      }
      video.coverUrl = coverUploadResult.publicUrl;
    }
    if (!await this.videoRepository.save(video)) {
        throw new Error('Failed to update video in database');
    }
  }

  async changeAudio(
    userId: string,
    publicationId: string,
    publicationName?: string,
    about?: string,
    tegs?: string[],
    audioBuffer?: Buffer,
    coverBuffer?: Buffer,
    audioMimeType?: string,
    coverMimeType?: string
  ): Promise<void> {
    const audio = await this.audioRepository.findOne({
      where: { publicationId, userId },
    });
    if (!audio) {
      throw new NotFoundException(`Audio with publicationId ${publicationId} not found or does not belong to the user`);
    }
    if (publicationName) {
      audio.publicationName = publicationName;
    }
    if (about) {
      audio.about = about;
    }
    if (tegs) {
      audio.tegs = tegs;
    }

    if (audioBuffer && audioMimeType.startsWith('audio/')) {
      try {
        await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: audio.audioUrl}));
      } catch (error) {
        throw new Error(`Failed to delete old audio file: ${error.message}`);
      }

      const audioUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId: audio.userId, fileBuffer: audioBuffer, mimeType: audioMimeType }));
      if (!audioUploadResult || !audioUploadResult.success) {
        throw new Error('Failed to upload audio');
      }
      audio.audioUrl = audioUploadResult.publicUrl;
    }

    if (coverBuffer && coverMimeType.startsWith('image/')) {
      try {
        await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: audio.coverUrl}));
      } catch (error) {
        throw new Error(`Failed to delete old cover image file: ${error.message}`);
      }
      const coverUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId: audio.userId, fileBuffer: coverBuffer, mimeType: coverMimeType }));
      if (!coverUploadResult || !coverUploadResult.success) {
        throw new Error('Failed to upload cover image');
      }
      audio.coverUrl = coverUploadResult.publicUrl;
    }

    if (!await this.audioRepository.save(audio)) {
        throw new Error('Failed to update audio in database');
    }
  }

  async changePhoto(
    userId: string,
    publicationId: string,
    publicationName?: string,
    about?: string,
    tegs?: string[],
    photoBuffer?: Buffer,
    photoMimeType?: string
  ): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { publicationId, userId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with publicationId ${publicationId} not found or does not belong to the user`);
    }
    if (publicationName) {
      photo.publicationName = publicationName;
    }
    if (about) {
      photo.about = about;
    }
    if (tegs) {
      photo.tegs = tegs;
    }

    if (photoBuffer && photoMimeType.startsWith('image/')) {
      try {
        await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: photo.photoUrl}));
      } catch (error) {
        throw new Error(`Failed to delete old photo file: ${error.message}`);
      }
      const photoUploadResult = await firstValueFrom(this.googleDriveService.uploadFile({ userId: photo.userId, fileBuffer: photoBuffer, mimeType: photoMimeType }));

      if (!photoUploadResult || !photoUploadResult.success) {
        throw new Error('Failed to upload photo');
      }
      photo.photoUrl = photoUploadResult.publicUrl;
    }

    if (!await this.photoRepository.save(photo)) {
        throw new Error('Failed to update photo in database');
    }
  }

  async deleteVideo(publicationId: string, userId: string): Promise<void> {
    const video = await this.videoRepository.findOne({
      where: { publicationId },
    });
    if (!video) {
      throw new NotFoundException(`Video with publicationId ${publicationId} not found`);
    }
    if (video.userId !== userId) {
      throw new NotFoundException(`Video with publicationId ${publicationId} does not belong to the user`);
    }
    try {
    await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: video.coverUrl}));
    await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: video.videoUrl}));
    }
    catch (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
    await this.videoRepository.remove(video);

    if(!await firstValueFrom(this.metricsService.removePublication({ publicationId: publicationId, userId: userId }))) {
      throw new Error('Failed to remove publication from metrics');
    }
  }

  async deleteAudio(publicationId: string, userId: string): Promise<void> {
    const audio = await this.audioRepository.findOne({
      where: { publicationId },
    });
    if (!audio) {
      throw new NotFoundException(`Audio with publicationId ${publicationId} not found`);
    }
    if (audio.userId !== userId) {
      throw new NotFoundException(`Audio with publicationId ${publicationId} does not belong to the user`);
    }
    try {
      await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: audio.coverUrl}));
      await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: audio.audioUrl}));
    }
    catch (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
    await this.audioRepository.remove(audio);
    if(!await firstValueFrom(this.metricsService.removePublication({ publicationId: publicationId, userId: userId }))) {
      throw new Error('Failed to remove publication from metrics');
    }
  }

  async deletePhoto(publicationId: string, userId: string): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { publicationId },
    });
    if (photo.userId !== userId) {
      throw new NotFoundException(`Photo with publicationId ${publicationId} does not belong to the user`);
    }
    if (!photo) {
      throw new NotFoundException(`Photo with publicationId ${publicationId} not found`);
    }
    try {
      await firstValueFrom(this.googleDriveService.deleteFile({fileUrl: photo.photoUrl}));
    }
    catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    await this.photoRepository.remove(photo);
    if(!await firstValueFrom(this.metricsService.removePublication({ publicationId: publicationId, userId: userId }))) {
      throw new Error('Failed to remove publication from metrics');
    }
  }

  async deleteUserContent(userId: string): Promise<void> {
    const videos = await this.videoRepository.find({ where: { userId } });
    const audios = await this.audioRepository.find({ where: { userId } });
    const photos = await this.photoRepository.find({ where: { userId } });

    if (videos.length > 0) {
      await this.videoRepository.remove(videos);
    }
    if (audios.length > 0) {
      await this.audioRepository.remove(audios);
    }
    if (photos.length > 0) {
      await this.photoRepository.remove(photos);
    }
  }

}
