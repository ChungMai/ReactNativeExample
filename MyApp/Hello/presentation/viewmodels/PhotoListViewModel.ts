import type { Photo } from '../../domain/entities/Photo';
import { AllFilter, AuthorFilter, FavoriteFilter, type PhotoFilter } from '../../domain/filters/PhotoFilter';
import { PhotoQuery } from '../../domain/filters/PhotoQuery';
import type { GetPhotosInput } from '../../domain/usecases/GetPhotos';
import type { UseCase } from '../../domain/usecases/UseCase';
import { BaseViewModel } from './BaseViewModel';

export type PhotoTab = 'all' | 'favorites';

export class PhotoListViewModel extends BaseViewModel {
  static readonly PAGE_SIZE = 50;
  static readonly tabs = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
  ] as const;

  private photos: Photo[] = [];
  private favoriteIds = new Set<string>();
  // A failed action (e.g. saving a favorite) is shown, not thrown into the void.
  actionError: string | null = null;
  tab: PhotoTab = 'all';
  author = '';

  constructor(
    private readonly getPhotos: UseCase<GetPhotosInput, Photo[]>,
    private readonly getFavorites: UseCase<void, Photo[]>,
    private readonly toggleFavoriteUseCase: UseCase<Photo, boolean>,
  ) {
    super();
  }

  override init(): Promise<void> {
    return this.load(
      () => Promise.all([this.getPhotos.execute({ limit: PhotoListViewModel.PAGE_SIZE, uniqueAuthors: true }), this.getFavorites.execute()]),
      ([photos, favorites]) => {
        this.photos = photos;
        this.favoriteIds = new Set(favorites.map(f => f.id));
      },
    );
  }

  // Polymorphism: whichever filter the tab selects, the query treats it as a PhotoFilter.
  private get tabFilter(): PhotoFilter {
    return this.tab === 'favorites' ? new FavoriteFilter(this.favoriteIds) : new AllFilter();
  }

  get visiblePhotos(): Photo[] {
    const query = new PhotoQuery().and(this.tabFilter);
    if (this.author.trim()) {
      query.and(new AuthorFilter(this.author.trim()));
    }
    return query.run(this.photos);
  }

  get favoriteCount(): number {
    return this.favoriteIds.size;
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds.has(id);
  }

  selectTab(tab: PhotoTab): void {
    this.tab = tab;
    this.notify();
  }

  setAuthor(author: string): void {
    this.author = author;
    this.notify();
  }

  async toggleFavorite(photo: Photo): Promise<void> {
    try {
      const isFavorite = await this.toggleFavoriteUseCase.execute(photo);
      if (isFavorite) {
        this.favoriteIds.add(photo.id);
      } else {
        this.favoriteIds.delete(photo.id);
      }
      this.actionError = null;
    } catch (e) {
      this.actionError = `Cannot update favorites: ${e instanceof Error ? e.message : 'unknown error'}`;
    }
    this.notify();
  }
}
