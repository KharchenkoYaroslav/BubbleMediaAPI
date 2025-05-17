import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from './entities/comment.entity';
import { Photo } from './entities/photo.entity';
import { Video } from './entities/video.entity';
import { Audio } from './entities/audio.entity';

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
  ) {}

  async createComment(userId: string, publicationId: string, comment: string): Promise<string> {
    const photoExists = await this.photoRepository.exists({ where: { publicationId } });
    const videoExists = await this.videoRepository.exists({ where: { publicationId } });
    const audioExists = await this.audioRepository.exists({ where: { publicationId } });

    if (!photoExists && !videoExists && !audioExists) {
      throw new NotFoundException(`Publication with ID ${publicationId} not found.`);
    }

    const id = uuidv4();

    const newComment = this.commentRepository.create({
      id,
      userId,
      publicationId,
      comment,
    });

    await this.commentRepository.save(newComment);

    return id;
  }

  async PublicationComments(publicationId: string): Promise<{ comments: Comment[] }> {
    const comments = await this.commentRepository.find({
      where: { publicationId }
    });
    if (!comments || comments.length === 0) {
      throw new NotFoundException(`No comments found for publication with ID ${publicationId}`);
    }
    return { comments };
  }

  async deleteUserComments(userId: string): Promise<void> {
    const comments = await this.commentRepository.find({
      where: { userId }
    });

    if (comments.length > 0) {
      await this.commentRepository.remove(comments);
    }
  }
}
