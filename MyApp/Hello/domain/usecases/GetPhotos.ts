import type { Photo } from '../entities/Photo';
import type { PhotoRepository } from '../repositories/PhotoRepository';
import type { UseCase } from './UseCase';

export interface GetPhotosInput {
  page?: number;
  limit?: number;
  // Keep only the first photo of each author.
  uniqueAuthors?: boolean;
}

export class GetPhotos implements UseCase<GetPhotosInput, Photo[]> {
  constructor(private readonly repository: PhotoRepository) {}

  async execute({ page = 1, limit = 10, uniqueAuthors = false }: GetPhotosInput = {}): Promise<Photo[]> {
    const photos = await this.repository.getPhotos(page, limit);
    return GetPhotos.distinct(photos, uniqueAuthors ? p => p.author : p => p.id);
  }

  // Keeps the first photo for every key, preserving the original order.
  private static distinct(photos: Photo[], keyOf: (photo: Photo) => string): Photo[] {
    const seen = new Set<string>();
    return photos.filter(photo => {
      const key = keyOf(photo);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
