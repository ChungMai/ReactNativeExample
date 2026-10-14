import type { Comment } from '../entities/Comment';
import type { CommentRepository } from '../repositories/CommentRepository';
import type { UseCase } from './UseCase';

export class GetComments implements UseCase<string, Comment[]> {
  constructor(private readonly repository: CommentRepository) {}

  // Newest first.
  async execute(photoId: string): Promise<Comment[]> {
    const comments = await this.repository.getByPhoto(photoId);
    return [...comments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
