import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GoogleDriveService {
  private auth: JWT;
  private drive;

  private readonly folderId = '1YalRXNDMeUr-a7GdhF2syVtIEddqI1Mt';

  constructor() {

    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async init(userId: string): Promise<void> {
    try {
      const userFolder = await this.drive.files.create({
        requestBody: {
          name: userId,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId],
      },
      fields: 'id',
    });
    const userFolderId = userFolder.data.id;

    const subfolders = ['avatar', 'photo', 'video', 'audio'];

    for (const subfolder of subfolders) {
      await this.drive.files.create({
        requestBody: {
          name: subfolder,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [userFolderId],
        },
        fields: 'id',
      });
    }

    } catch (error) {
      throw new Error(error.message);
    }
  }

  async uploadFile(
    userId: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ publicUrl: string }> {
    try {
      let subfolder: string | null = null;
      if (mimeType.startsWith('video/')) {
        subfolder = 'video';
      } else if (mimeType.startsWith('audio/')) {
        subfolder = 'audio';
      } else if (mimeType.startsWith('image/')) {
        subfolder = 'photo';
      }

      if (!subfolder) {
        throw new Error(`Unsupported file type: ${mimeType}. Only video, audio, and image files are supported.`);
      }

      const extension = mime.extension(mimeType) || 'bin';
      const fileName = `${uuidv4()}.${extension}`;

      const userFolderQuery = await this.drive.files.list({
        q: `name='${userId}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents`,
        fields: 'files(id)',
      });

      if (!userFolderQuery.data.files || userFolderQuery.data.files.length === 0) {
        throw new Error(`User folder not found for user: ${userId}`);
      }

      const userFolderId = userFolderQuery.data.files[0].id;

      const subfolderQuery = await this.drive.files.list({
        q: `name='${subfolder}' and mimeType='application/vnd.google-apps.folder' and '${userFolderId}' in parents`,
        fields: 'files(id)',
      });

      if (!subfolderQuery.data.files || subfolderQuery.data.files.length === 0) {
        throw new Error(`Subfolder '${subfolder}' not found for user: ${userId}`);
      }

      const subfolderId = subfolderQuery.data.files[0].id;

      const fileMetadata = {
        name: fileName,
        parents: [subfolderId],
      };

      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);

      const media = {
        mimeType,
        body: stream,
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });

      const fileId = file.data.id;

      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

      return { publicUrl };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<{ publicUrl: string }> {
    try {

      const userFolderQuery = await this.drive.files.list({
        q: `name='${userId}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents`,
        fields: 'files(id)',
      });

      if (!userFolderQuery.data.files || userFolderQuery.data.files.length === 0) {
        throw new Error(`User folder not found for user: ${userId}`);
      }

      const userFolderId = userFolderQuery.data.files[0].id;

      const avatarFolderQuery = await this.drive.files.list({
        q: `name='avatar' and mimeType='application/vnd.google-apps.folder' and '${userFolderId}' in parents`,
        fields: 'files(id)',
      });

      if (!avatarFolderQuery.data.files || avatarFolderQuery.data.files.length === 0) {
        throw new Error(`Avatar folder not found for user: ${userId}`);
      }

      const avatarFolderId = avatarFolderQuery.data.files[0].id;

      const existingAvatarQuery = await this.drive.files.list({
        q: `name='avatar' and '${avatarFolderId}' in parents`,
        fields: 'files(id)',
      });

      if (existingAvatarQuery.data.files && existingAvatarQuery.data.files.length > 0) {
        await this.drive.files.delete({
          fileId: existingAvatarQuery.data.files[0].id,
        });
      }

      const fileMetadata = {
        name: 'avatar',
        parents: [avatarFolderId],
      };

      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);

      const media = {
        mimeType,
        body: stream,
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });

      const fileId = file.data.id;

      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

      return { publicUrl };
    } catch (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileId = fileUrl.split('id=')[1]?.split('&')[0];
      if (!fileId) {
        throw new Error('Invalid file URL format');
      }

      await this.drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteUserFolder(userId: string): Promise<void> {
    try {
      const userFolderQuery = await this.drive.files.list({
        q: `name='${userId}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents`,
        fields: 'files(id)',
      });

      if (!userFolderQuery.data.files || userFolderQuery.data.files.length === 0) {
        throw new Error(`User folder not found for user: ${userId}`);
      }

      const userFolderId = userFolderQuery.data.files[0].id;

      const filesQuery = await this.drive.files.list({
        q: `'${userFolderId}' in parents`,
        fields: 'files(id)',
      });

      if (filesQuery.data.files) {
        for (const file of filesQuery.data.files) {
          await this.drive.files.delete({
            fileId: file.id,
          });
        }
      }

      await this.drive.files.delete({
        fileId: userFolderId,
      });
    } catch (error) {
      throw new Error(`Failed to delete user folder: ${error.message}`);
    }
  }
}
