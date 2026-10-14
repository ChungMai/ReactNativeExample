import type { Photo } from '../entities/Photo';
import type { PhotoFilter } from './PhotoFilter';

// Methods return `this`, so chaining keeps the subclass type (slides 16-17).
export class PhotoQuery {
  protected filters: PhotoFilter[] = [];

  and(filter: PhotoFilter): this {
    this.filters.push(filter);
    return this;
  }

  run(photos: Photo[]): Photo[] {
    return this.filters.reduce((result, f) => f.apply(result), photos);
  }
}
