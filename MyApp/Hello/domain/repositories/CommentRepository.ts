import type { Comment } from '../entities/Comment';

export interface CommentRepository {
  getByPhoto(photoId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | undefined>;
  add(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  remove(id: string): Promise<void>;
}
