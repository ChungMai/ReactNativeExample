import type { Comment } from '../domain/entities/Comment';
import type { Photo } from '../domain/entities/Photo';
import type { CommentRepository } from '../domain/repositories/CommentRepository';
import type { FavoriteRepository } from '../domain/repositories/FavoriteRepository';
import type { IdGenerator } from '../domain/services/IdGenerator';

export class FakeCommentRepository implements CommentRepository {
  items = new Map<string, Comment>();
  async getByPhoto(photoId: string) {
    return [...this.items.values()].filter(c => c.photoId === photoId);
  }
  async findById(id: string) {
    return this.items.get(id);
  }
  async add(c: Comment) {
    this.items.set(c.id, c);
  }
  async update(c: Comment) {
    this.items.set(c.id, c);
  }
  async remove(id: string) {
    this.items.delete(id);
  }
}

export class FakeFavoriteRepository implements FavoriteRepository {
  items = new Map<string, Photo>();
  async getAll() {
    return [...this.items.values()];
  }
  async findById(id: string) {
    return this.items.get(id);
  }
  async add(p: Photo) {
    this.items.set(p.id, p);
  }
  async remove(id: string) {
    this.items.delete(id);
  }
}

export class SequenceIds implements IdGenerator {
  private n = 0;
  next(): string {
    this.n += 1;
    return `id${this.n}`;
  }
}
