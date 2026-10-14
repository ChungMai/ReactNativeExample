import type { Photo } from '../entities/Photo';

export interface PhotoRepository {
  getPhotos(page: number, limit: number): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo>;
}
