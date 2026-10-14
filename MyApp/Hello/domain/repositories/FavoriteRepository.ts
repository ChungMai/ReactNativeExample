import type { Photo } from '../entities/Photo';

export interface FavoriteRepository {
  getAll(): Promise<Photo[]>;
  findById(id: string): Promise<Photo | undefined>;
  add(photo: Photo): Promise<void>;
  remove(id: string): Promise<void>;
}
