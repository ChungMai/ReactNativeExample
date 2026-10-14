import type { Photo } from '../../domain/entities/Photo';
import type { FavoriteRepository } from '../../domain/repositories/FavoriteRepository';
import type { PhotoDto } from '../dto/PhotoDto';
import { toPhoto, toPhotoDto } from '../mappers/PhotoMapper';
import type { KeyValueStorage } from '../storage/KeyValueStorage';
import { StoredRepository } from '../storage/StoredRepository';

export class StoredFavoriteRepository
  extends StoredRepository<Photo, PhotoDto>
  implements FavoriteRepository
{
  constructor(storage: KeyValueStorage) {
    super(storage, 'favorites');
  }

  protected toDto(photo: Photo): PhotoDto {
    return toPhotoDto(photo);
  }

  protected fromDto(dto: PhotoDto): Photo {
    return toPhoto(dto);
  }

  getAll(): Promise<Photo[]> {
    return this.all();
  }

  findById(id: string): Promise<Photo | undefined> {
    return this.find(id);
  }

  add(photo: Photo): Promise<void> {
    return this.put(photo);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }
}
