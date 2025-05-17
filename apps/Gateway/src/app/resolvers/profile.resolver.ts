import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GetProfileResponse } from '../dto/profile/get-profile.response';
import { GetAvatarResponse } from '../dto/profile/get-avatar.response';
import { UpdateAboutInput } from '../dto/profile/update-about.input';
import { UpdateAvatarInput } from '../dto/profile/update-avatar.input';
import { AddSubscriptionInput } from '../dto/profile/add-subscription.input';
import { RemoveSubscriptionInput } from '../dto/profile/remove-subscription.input';

interface ProfileServiceGrpc {
  getProfile(data: { userId: string }): Observable<GetProfileResponse>;
  getAvatar(data: { userId: string }): Observable<GetAvatarResponse>;
  updateAbout(data: UpdateAboutInput & { userId: string }): Observable<{ success: boolean }>;
  updateAvatar(data: { userId: string; fileBuffer: Buffer; mimeType: string }): Observable<{ success: boolean }>; // Corrected signature
  addSubscription(data: AddSubscriptionInput & { userId: string }): Observable<{ success: boolean }>;
  removeSubscription(data: RemoveSubscriptionInput & { userId: string }): Observable<{ success: boolean }>;
}

@Resolver()
export class ProfileResolver {
  private profileService: ProfileServiceGrpc;

  constructor(@Inject('PROFILE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.profileService = this.client.getService<ProfileServiceGrpc>('ProfileService');
  }

  @Query(() => GetProfileResponse)
  async getProfile(@Args('userId') userId: string) {
    return firstValueFrom(this.profileService.getProfile({ userId }));
  }

  @Query(() => GetAvatarResponse)
  async getAvatar(@Args('userId') userId: string) {
    return firstValueFrom(this.profileService.getAvatar({ userId }));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateAbout(@Args('data') data: UpdateAboutInput, @Context() context) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.profileService.updateAbout(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateAvatar(@Args('data') data: UpdateAvatarInput, @Context() context) {
    const userId = context.req.user.sub;
    const { createReadStream, mimetype } = await data.file;
    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      const stream = createReadStream();
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks as Uint8Array[])));
      stream.on('error', reject);
    });

    const response = await firstValueFrom(
      this.profileService.updateAvatar({
        userId,
        fileBuffer,
        mimeType: mimetype,
      })
    );
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async addSubscription(@Args('data') data: AddSubscriptionInput, @Context() context) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.profileService.addSubscription(grpcData));
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeSubscription(@Args('data') data: RemoveSubscriptionInput, @Context() context) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(this.profileService.removeSubscription(grpcData));
    return response.success;
  }
}
