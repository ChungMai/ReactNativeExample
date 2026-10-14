import type { Photo } from '../entities/Photo';
import type { PhotoRepository } from '../repositories/PhotoRepository';
import type { UseCase } from './UseCase';

export class GetPhotoDetail implements UseCase<string, Photo> {
  constructor(private readonly repository: PhotoRepository) {}

  execute(id: string): Promise<Photo> {
    return this.repository.getPhoto(id);
  }
}
