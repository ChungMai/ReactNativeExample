import type { Comment } from '../entities/Comment';
import type { CommentRepository } from '../repositories/CommentRepository';
import type { UseCase } from './UseCase';

export interface EditCommentInput {
  id: string;
  text: string;
}

export class EditComment implements UseCase<EditCommentInput, Comment> {
  constructor(private readonly repository: CommentRepository) {}

  async execute({ id, text }: EditCommentInput): Promise<Comment> {
    const comment = await this.repository.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    comment.text = text; // the setter validates and marks it as edited
    await this.repository.update(comment);
    return comment;
  }
}
