import type { Photo } from '../entities/Photo';

// Interface = contract (slide 19).
export interface Describable {
  describe(): string;
}

// Abstract class shares code, subclasses must implement matches() (slide 18).
export abstract class PhotoFilter implements Describable {
  constructor(readonly label: string) {}

  abstract matches(photo: Photo): boolean;

  apply(photos: Photo[]): Photo[] {
    return photos.filter(p => this.matches(p));
  }

  describe(): string {
    return `Filter "${this.label}"`;
  }
}

export class AllFilter extends PhotoFilter {
  constructor() {
    super('All');
  }
  matches(): boolean {
    return true;
  }
}

export class FavoriteFilter extends PhotoFilter {
  constructor(private readonly favoriteIds: ReadonlySet<string>) {
    super('Favorites');
  }
  matches(photo: Photo): boolean {
    return this.favoriteIds.has(photo.id);
  }
}

export class AuthorFilter extends PhotoFilter {
  constructor(private readonly author: string) {
    super(`Author: ${author}`);
  }
  matches(photo: Photo): boolean {
    return photo.author.toLowerCase().includes(this.author.toLowerCase());
  }
  override describe(): string {
    return `${super.describe()} (contains "${this.author}")`;
  }
}
