import { Comment } from '../entities/Comment';
import type { CommentRepository } from '../repositories/CommentRepository';
import type { IdGenerator } from '../services/IdGenerator';
import type { UseCase } from './UseCase';

export interface AddCommentInput {
  photoId: string;
  text: string;
}

export class AddComment implements UseCase<AddCommentInput, Comment> {
  constructor(
    private readonly repository: CommentRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute({ photoId, text }: AddCommentInput): Promise<Comment> {
    const comment = Comment.create(this.ids.next(), photoId, text); // throws ValidationError
    await this.repository.add(comment);
    return comment;
  }
}
