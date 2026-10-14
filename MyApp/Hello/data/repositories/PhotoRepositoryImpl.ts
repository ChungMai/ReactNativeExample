import type { Photo } from '../../domain/entities/Photo';
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import type { PicsumApi } from '../datasources/PicsumApi';
import type { PhotoDto } from '../dto/PhotoDto';
import { toPhoto } from '../mappers/PhotoMapper';
import type { KeyValueStorage } from '../storage/KeyValueStorage';

const CACHE_KEY = 'photos:cache';

// Network first; if the network fails, fall back to the last list we saved.
export class PhotoRepositoryImpl implements PhotoRepository {
  constructor(
    private readonly api: PicsumApi,
    private readonly storage: KeyValueStorage,
  ) {}

  async getPhotos(page: number, limit: number): Promise<Photo[]> {
    try {
      const dtos = await this.api.fetchPhotos(page, limit);
      if (page === 1) {
        await this.writeCache(dtos);
      }
      return dtos.map(toPhoto);
    } catch (error) {
      const cached = page === 1 ? await this.readCache() : [];
      if (cached.length > 0) {
        return cached.map(toPhoto);
      }
      throw this.describe(error);
    }
  }

  async getPhoto(id: string): Promise<Photo> {
    try {
      return toPhoto(await this.api.fetchPhoto(id));
    } catch (error) {
      const hit = (await this.readCache()).find(dto => dto.id === id);
      if (hit) {
        return toPhoto(hit);
      }
      throw this.describe(error);
    }
  }

  private describe(error: unknown): Error {
    if (error instanceof Error && error.message.includes('Network request failed')) {
      return new Error('Cannot reach the server. Please check your connection.');
    }
    return error instanceof Error ? error : new Error('Something went wrong');
  }

  private async writeCache(dtos: PhotoDto[]): Promise<void> {
    try {
      await this.storage.setItem(CACHE_KEY, JSON.stringify(dtos));
    } catch {
      // The cache is best effort: never fail a successful request because of it.
    }
  }

  private async readCache(): Promise<PhotoDto[]> {
    try {
      const raw = await this.storage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as PhotoDto[]) : [];
    } catch {
      return [];
    }
  }
}
