import type { Comment } from '../../domain/entities/Comment';
import type { CommentRepository } from '../../domain/repositories/CommentRepository';
import type { CommentDto } from '../dto/CommentDto';
import { toComment, toCommentDto } from '../mappers/CommentMapper';
import type { KeyValueStorage } from '../storage/KeyValueStorage';
import { StoredRepository } from '../storage/StoredRepository';

export class StoredCommentRepository
  extends StoredRepository<Comment, CommentDto>
  implements CommentRepository
{
  constructor(storage: KeyValueStorage) {
    super(storage, 'comments');
  }

  protected toDto(comment: Comment): CommentDto {
    return toCommentDto(comment);
  }

  protected fromDto(dto: CommentDto): Comment {
    return toComment(dto);
  }

  async getByPhoto(photoId: string): Promise<Comment[]> {
    return (await this.all()).filter(c => c.photoId === photoId);
  }

  findById(id: string): Promise<Comment | undefined> {
    return this.find(id);
  }

  add(comment: Comment): Promise<void> {
    return this.put(comment);
  }

  update(comment: Comment): Promise<void> {
    return this.put(comment);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }
}
