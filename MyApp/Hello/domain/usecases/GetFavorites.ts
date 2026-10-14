import type { Photo } from '../entities/Photo';
import type { FavoriteRepository } from '../repositories/FavoriteRepository';
import type { UseCase } from './UseCase';

export class GetFavorites implements UseCase<void, Photo[]> {
  constructor(private readonly repository: FavoriteRepository) {}

  execute(): Promise<Photo[]> {
    return this.repository.getAll();
  }
}
