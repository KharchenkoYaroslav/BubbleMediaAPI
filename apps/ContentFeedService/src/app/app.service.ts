import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Photo } from './entities/photo.entity';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';
import { GetAvatarResponse } from './dto/get-avatar.response';
import { GetLoginResponse } from './dto/get-login.response';
import { PostsRequestDto } from './dto/posts.request.dto';
import { TopPostsResponseDto } from './dto/top-posts.response.dto';
import { GetLikedPublicationsResponseDto } from './dto/get-liked-publications.response';
import { PublicationDto } from './dto/publication.dto';

interface ProfileServiceGrpc {
  getAvatar(data: { userId: string }): Observable<GetAvatarResponse>;
  getSubscriptions(data: {
    userId: string;
  }): Observable<{ subscriptions: string[] }>;
}

interface AuthServiceGrpc {
  getLogin(data: { userId: string }): Observable<GetLoginResponse>;
}

interface MetricsServiceGrpc {
  getRecentTopPosts(data: PostsRequestDto): Observable<TopPostsResponseDto>;
  GetLikedPublications(data: {
    userId: string;
  }): Observable<GetLikedPublicationsResponseDto>;
}

@Injectable()
export class AppService {
  private profileService: ProfileServiceGrpc;
  private metricsService: MetricsServiceGrpc;
  private authService: AuthServiceGrpc;

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @Inject('PROFILE_PACKAGE')
    private profileClient: ClientGrpc,
    @Inject('METRICS_PACKAGE')
    private metricsClient: ClientGrpc,
    @Inject('AUTH_PACKAGE')
    private authClient: ClientGrpc
  ) {}

  public initGrpc() {
    this.profileService =
      this.profileClient.getService<ProfileServiceGrpc>('ProfileService');
    this.metricsService =
      this.metricsClient.getService<MetricsServiceGrpc>('MetricsService');
    this.authService =
      this.authClient.getService<AuthServiceGrpc>('AuthService');
  }

  async getUserPublications(
    postsRequest: PostsRequestDto,
    userId: string,
    tegs?: string[]
  ): Promise<PublicationDto[]> {
    const [photoMeta, videoMeta, audioMeta] = await Promise.all([
      this.photoRepository.find({
        where: { userId },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
      this.videoRepository.find({
        where: { userId },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
      this.audioRepository.find({
        where: { userId },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
    ]);

    const allMeta = [
      ...photoMeta.map((p) => ({
        publicationId: p.publicationId,
        tegs: p.tegs,
        createdAt: p.createdAt,
        userId: p.userId,
        type: 'photo' as const,
      })),
      ...videoMeta.map((v) => ({
        publicationId: v.publicationId,
        tegs: v.tegs,
        createdAt: v.createdAt,
        userId: v.userId,
        type: 'video' as const,
      })),
      ...audioMeta.map((a) => ({
        publicationId: a.publicationId,
        tegs: a.tegs,
        createdAt: a.createdAt,
        userId: a.userId,
        type: 'audio' as const,
      })),
    ];

    const filteredMeta = this.filterPublications(allMeta, tegs, userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(postsRequest.start, postsRequest.end);

    const publications = await Promise.all(
      filteredMeta.map(async ({ publicationId, type }) => {
        const [publication] = await this.fetchPublicationsByIds(
          [publicationId],
          type
        );
        if (!publication) return null;
        return this.enrichPublication(publication, type);
      })
    );

    return publications.filter(Boolean) as PublicationDto[];
  }

  async getRecentTopPosts(
    postsRequest: PostsRequestDto,
    tegs?: string[],
    authorId?: string
  ): Promise<PublicationDto[]> {
    const topPostsResponse = await firstValueFrom(
      this.metricsService.getRecentTopPosts(postsRequest)
    );
    const posts = topPostsResponse.posts;
    const start = postsRequest?.start ?? 0;
    const end = postsRequest?.end ?? posts.length;

    const allPublicationIds = posts.map((post) => post.publicationId);
    const filteredMeta = await this.fetchMetadataByIds(
      allPublicationIds,
      tegs,
      authorId
    );
    const slicedMeta = filteredMeta.slice(start, end);

    const publications = await Promise.all(
      slicedMeta.map(async ({ publicationId, type }) => {
        const [publication] = await this.fetchPublicationsByIds(
          [publicationId],
          type
        );
        if (!publication) return null;
        return this.enrichPublication(publication, type);
      })
    );

    return publications.filter(Boolean) as PublicationDto[];
  }

  async getLikedPublications(
    postsRequest: PostsRequestDto,
    userId: string,
    tegs?: string[],
    authorId?: string
  ): Promise<PublicationDto[]> {
    const liked: GetLikedPublicationsResponseDto = await firstValueFrom(
      this.metricsService.GetLikedPublications({ userId })
    );

    const allPublicationIds = liked.publicationId;
    const start = postsRequest?.start ?? 0;
    const end = postsRequest?.end ?? allPublicationIds.length;

    const filteredMeta = await this.fetchMetadataByIds(
      allPublicationIds,
      tegs,
      authorId
    );
    const slicedMeta = filteredMeta.slice(start, end);

    const publications = await Promise.all(
      slicedMeta.map(async ({ publicationId, type }) => {
        const [publication] = await this.fetchPublicationsByIds(
          [publicationId],
          type
        );
        if (!publication) return null;
        return this.enrichPublication(publication, type);
      })
    );

    return publications.filter(Boolean) as PublicationDto[];
  }

  async getRandomPublications(
    photoCount: number,
    videoCount: number,
    audioCount: number,
    tegs?: string[],
    authorId?: string
  ): Promise<PublicationDto[]> {
    const [photos, videos, audios] = await Promise.all([
      this.getRandomItems(this.photoRepository, photoCount),
      this.getRandomItems(this.videoRepository, videoCount),
      this.getRandomItems(this.audioRepository, audioCount),
    ]);

    const all = [
      ...photos.map((p) => ({ ...p, type: 'photo' as const })),
      ...videos.map((v) => ({ ...v, type: 'video' as const })),
      ...audios.map((a) => ({ ...a, type: 'audio' as const })),
    ];

    const filtered = this.filterPublications(all, tegs, authorId);

    return Promise.all(
      filtered.map((publication) =>
        this.enrichPublication(publication, publication.type)
      )
    );
  }

  async getSubscriptionsPublications(
    postsRequest: PostsRequestDto,
    userId: string,
    tegs?: string[],
    authorId?: string
  ): Promise<PublicationDto[]> {
    const subscriptions = (
      await firstValueFrom(this.profileService.getSubscriptions({ userId }))
    ).subscriptions;
    if (!subscriptions?.length) return [];

    const [photoMeta, videoMeta, audioMeta] = await Promise.all([
      this.photoRepository.find({
        where: { userId: In(subscriptions) },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
      this.videoRepository.find({
        where: { userId: In(subscriptions) },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
      this.audioRepository.find({
        where: { userId: In(subscriptions) },
        select: ['publicationId', 'tegs', 'createdAt', 'userId'],
      }),
    ]);

    const allMeta = [
      ...photoMeta.map((p) => ({
        publicationId: p.publicationId,
        tegs: p.tegs,
        createdAt: p.createdAt,
        userId: p.userId,
        type: 'photo' as const,
      })),
      ...videoMeta.map((v) => ({
        publicationId: v.publicationId,
        tegs: v.tegs,
        createdAt: v.createdAt,
        userId: v.userId,
        type: 'video' as const,
      })),
      ...audioMeta.map((a) => ({
        publicationId: a.publicationId,
        tegs: a.tegs,
        createdAt: a.createdAt,
        userId: a.userId,
        type: 'audio' as const,
      })),
    ];

    const filteredMeta = this.filterPublications(allMeta, tegs, authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(postsRequest.start, postsRequest.end);

    const publications = await Promise.all(
      filteredMeta.map(async ({ publicationId, type }) => {
        const [publication] = await this.fetchPublicationsByIds(
          [publicationId],
          type
        );
        if (!publication) return null;
        return this.enrichPublication(publication, type);
      })
    );

    return publications.filter(Boolean) as PublicationDto[];
  }

  private async getRandomItems<T>(
    repository: Repository<T>,
    count: number
  ): Promise<T[]> {
    const itemCount = await repository.count();
    if (count >= itemCount) {
      return repository.find();
    }
    return repository
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  private filterPublications<T extends { tegs?: string[]; userId: string }>(
    items: T[],
    tegs?: string[],
    userId?: string
  ): T[] {
    let filteredItems = items;

    if (tegs && tegs.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        item.tegs?.some((teg) => tegs.includes(teg))
      );
    }

    if (userId) {
      filteredItems = filteredItems.filter((item) => item.userId === userId);
    }

    return filteredItems;
  }

  private async fetchMetadataByIds(
    ids: string[],
    tegs?: string[],
    userId?: string
  ): Promise<{ publicationId: string; type: 'photo' | 'video' | 'audio' }[]> {
    const [photoMeta, videoMeta, audioMeta] = await Promise.all([
      this.photoRepository.find({
        select: ['publicationId', 'tegs', 'userId'],
        where: { publicationId: In(ids) },
      }),
      this.videoRepository.find({
        select: ['publicationId', 'tegs', 'userId'],
        where: { publicationId: In(ids) },
      }),
      this.audioRepository.find({
        select: ['publicationId', 'tegs', 'userId'],
        where: { publicationId: In(ids) },
      }),
    ]);

    const allMeta = [
      ...photoMeta.map((p) => ({
        publicationId: p.publicationId,
        tegs: p.tegs,
        userId: p.userId,
        type: 'photo' as const,
      })),
      ...videoMeta.map((v) => ({
        publicationId: v.publicationId,
        tegs: v.tegs,
        userId: v.userId,
        type: 'video' as const,
      })),
      ...audioMeta.map((a) => ({
        publicationId: a.publicationId,
        tegs: a.tegs,
        userId: a.userId,
        type: 'audio' as const,
      })),
    ];

    const filtered = this.filterPublications(allMeta, tegs, userId);

    return filtered.map(({ publicationId, type }) => ({ publicationId, type }));
  }

  private async fetchPublicationsByIds(
    ids: string[],
    type: 'photo' | 'video' | 'audio'
  ): Promise<(Photo | Video | Audio)[]> {
    switch (type) {
      case 'photo':
        return this.photoRepository.find({ where: { publicationId: In(ids) } });
      case 'video':
        return this.videoRepository.find({ where: { publicationId: In(ids) } });
      case 'audio':
        return this.audioRepository.find({ where: { publicationId: In(ids) } });
    }
  }

  private async enrichPublication(
    publication: Photo | Video | Audio,
    type: 'photo' | 'video' | 'audio'
  ): Promise<PublicationDto> {
    const [loginResp, avatarResp] = await Promise.all([
      firstValueFrom(this.authService.getLogin({ userId: publication.userId })),
      firstValueFrom(
        this.profileService.getAvatar({ userId: publication.userId })
      ),
    ]);

    return {
      publicationId: publication.publicationId,
      userId: publication.userId,
      login: loginResp.login,
      avatarUrl: avatarResp.avatarUrl,
      publicationName: publication.publicationName,
      coverUrl:
        type === 'photo'
          ? (publication as Photo).photoUrl
          : (publication as Video | Audio).coverUrl,
      type,
    };
  }
}
