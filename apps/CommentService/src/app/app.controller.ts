import { Controller } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('CommentService', 'CreateComment')
  async createComment(data: {
    userId: string;
    publicationId: string;
    comment: string;
  }) {
    const response = await this.appService.createComment(
      data.userId,
      data.publicationId,
      data.comment
    );
    return { id: response,  success: true };
  }

  @GrpcMethod('CommentService', 'PublicationComments')
  async PublicationComments(data: { publicationId: string }) {
    const comments = await this.appService.PublicationComments(
      data.publicationId
    );
    return comments;
  }

  @EventPattern('delete_user_comments')
  async deleteUserComments(data: { userId: string }) {
    await this.appService.deleteUserComments(data.userId);
    return { success: true };
  }
}
