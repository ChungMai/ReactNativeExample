import { Comment } from '../../domain/entities/Comment';
import type { CommentDto } from '../dto/CommentDto';

export const toComment = (dto: CommentDto): Comment =>
  Comment.restore(
    dto.id,
    dto.photoId,
    dto.text,
    new Date(dto.createdAt),
    dto.editedAt ? new Date(dto.editedAt) : undefined,
  );

export const toCommentDto = (comment: Comment): CommentDto => ({
  id: comment.id,
  photoId: comment.photoId,
  text: comment.text,
  createdAt: comment.createdAt.toISOString(),
  editedAt: comment.editedAt?.toISOString(),
});
