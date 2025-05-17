import { Controller} from '@nestjs/common';
import { GoogleDriveService } from './app.service';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @EventPattern('init_google_drive')
  async init(data: { userId: string }) {
    await this.googleDriveService.init(data.userId);
  }

  @GrpcMethod('GoogleDriveService', 'UploadAvatar')
  async uploadAvatar(data: { userId: string, fileBuffer: Buffer, mimeType: string }) {
    const result = await this.googleDriveService.uploadAvatar(data.userId, data.fileBuffer, data.mimeType);
    return {
      success: true,
      publicUrl: result.publicUrl
    };
  }

  @GrpcMethod('GoogleDriveService', 'UploadFile')
  async uploadFile(data: { userId: string, fileBuffer: Buffer, mimeType: string }) {
    const result = await this.googleDriveService.uploadFile(data.userId, data.fileBuffer, data.mimeType);
    return {
      success: true,
      publicUrl: result.publicUrl
    };
  }

  @GrpcMethod('GoogleDriveService', 'DeleteFile')
  async deleteFile(data: { fileUrl: string }) {
    await this.googleDriveService.deleteFile(data.fileUrl);
    return { success: true };
  }

  @EventPattern('delete_user_folder')
  async deleteUserFolder(data: { userId: string }) {
    await this.googleDriveService.deleteUserFolder(data.userId);
  }
}
