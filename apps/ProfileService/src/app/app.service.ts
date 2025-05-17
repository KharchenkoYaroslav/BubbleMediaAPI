import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raw } from 'typeorm';
import { Profile } from './entities/profile.entity';

import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface GoogleDriveServiceGrpc {
  UploadAvatar(data: {
    userId: string;
    fileBuffer: Buffer;
    mimeType: string;
  }): Observable<{ success: boolean; publicUrl: string }>;
}

@Injectable()
export class AppService {
  private googleDriveService: GoogleDriveServiceGrpc;

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @Inject('GOOGLE_DRIVE_PACKAGE')
    private client: ClientGrpc
  ) {}

  public initGrpc(): void {
    this.googleDriveService = this.client.getService<GoogleDriveServiceGrpc>('GoogleDriveService');
  }

  async initProfile(userId: string): Promise<void> {
    try {
      const profile = this.profileRepository.create({
        userId,
      });

      await this.profileRepository.save(profile);
    } catch (error) {
      throw new Error(`Failed to initialize profile: ${error.message}`);
    }
  }

  async getProfile(userId: string): Promise<{ about: string; avatarUrl: string; subscriptions: string[]; subscribersCount: number; }> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error(`Profile with userId ${userId} not found`);
    }
    const subscribersCount = await this.profileRepository.count({
      where: { subscriptions: Raw((alias) => `${alias} @> :value`, { value: JSON.stringify([userId]) }) },
    });
    return {
      about: profile.about,
      avatarUrl: profile.avatarUrl,
      subscriptions: profile.subscriptions,
      subscribersCount: subscribersCount,
    };
  }

  async getAvatar(userId: string): Promise<string> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      select: ['avatarUrl'],
    });
    if (profile) {
      return profile.avatarUrl;
    }
    throw new Error(`Profile with userId ${userId} not found`);
  }

  async getSubscriptions(userId: string): Promise<string[]> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error(`Profile with userId ${userId} not found`);
    }
    return profile.subscriptions || [];
  }

  async updateAbout(userId: string, about: string): Promise<void> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        throw new Error(`Profile with userId ${userId} not found`);
      }

      profile.about = about;

      await this.profileRepository.save(profile);
    } catch (error) {
      throw new Error(
        `Failed to update about for profile with userId ${userId}: ${error.message}`
      );
    }
  }

  async updateAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        throw new Error(`Profile with userId ${userId} not found`);
      }

      const result = await firstValueFrom(
        this.googleDriveService.UploadAvatar({
          userId: userId,
          fileBuffer,
          mimeType,
        })
      );

      if (result.success) {
        profile.avatarUrl = result.publicUrl;
        await this.profileRepository.save(profile);
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error(
        `Failed to update avatar for profile with userId ${userId}: ${error.message}`
      );
    }
  }

  async addSubscription(userId: string, subscription: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error(`Profile with userId ${userId} not found`);
    }
    profile.subscriptions = [...(profile.subscriptions || []), subscription];
    this.profileRepository.save(profile);
  }

  async removeSubscription(userId: string, subscriptionToRemove: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error(`Profile with userId ${userId} not found`);
    }
    profile.subscriptions = (profile.subscriptions || []).filter(
      (subscription) => subscription !== subscriptionToRemove
    );
    this.profileRepository.save(profile);
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error(`Profile with userId ${userId} not found`);
    }
    this.profileRepository.remove(profile);
  }
}
