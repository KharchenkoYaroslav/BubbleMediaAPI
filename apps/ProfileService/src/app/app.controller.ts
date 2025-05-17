import { Controller } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('init_profile')
  async initProfile(data: { userId: string }) {
    await this.appService.initProfile(data.userId);
  }

  @GrpcMethod('ProfileService', 'GetProfile')
  async getProfile(data: { userId: string }) {
    return await this.appService.getProfile(data.userId);
  }

  @GrpcMethod('ProfileService', 'GetAvatar')
  async getAvatar(data: { userId: string }) {
    const avatarUrl = await this.appService.getAvatar(data.userId);
    return { avatarUrl };
  }

  @GrpcMethod('ProfileService', 'UpdateAbout')
  async updateAbout(data: { userId: string; about: string }) {
    await this.appService.updateAbout(data.userId, data.about);
    return { success: true };
  }

  @GrpcMethod('ProfileService', 'UpdateAvatar')
  async updateAvatar(data: { userId: string; fileBuffer: Buffer; mimeType: string }) {
    await this.appService.updateAvatar(data.userId, data.fileBuffer, data.mimeType);
    return { success: true };
  }

  @GrpcMethod('ProfileService', 'AddSubscription')
  async addSubscription(data: { userId: string; subscription: string }) {
    await this.appService.addSubscription(data.userId, data.subscription);
    return { success: true };
  }

  @GrpcMethod('ProfileService', 'RemoveSubscription')
  async removeSubscription(data: { userId: string; subscriptionToRemove: string }) {
    await this.appService.removeSubscription(data.userId, data.subscriptionToRemove);
    return { success: true };
  }

  @GrpcMethod('ProfileService', 'GetSubscriptions')
  async getSubscriptions(data: { userId: string }) {
    return { subscriptions: await this.appService.getSubscriptions(data.userId) };
  }

  @EventPattern('delete_profile')
  async deleteProfile(data: { userId: string }) {
    await this.appService.deleteProfile(data.userId);
  }
}
