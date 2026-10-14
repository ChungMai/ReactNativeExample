import type { CommentRepository } from '../repositories/CommentRepository';
import type { UseCase } from './UseCase';

export class DeleteComment implements UseCase<string, void> {
  constructor(private readonly repository: CommentRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
