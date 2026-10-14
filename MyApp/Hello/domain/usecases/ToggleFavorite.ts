import type { Photo } from '../entities/Photo';
import type { FavoriteRepository } from '../repositories/FavoriteRepository';
import type { UseCase } from './UseCase';

// Returns true when the photo is a favorite after the toggle.
export class ToggleFavorite implements UseCase<Photo, boolean> {
  constructor(private readonly repository: FavoriteRepository) {}

  async execute(photo: Photo): Promise<boolean> {
    if (await this.repository.findById(photo.id)) {
      await this.repository.remove(photo.id);
      return false;
    }
    await this.repository.add(photo);
    return true;
  }
}
