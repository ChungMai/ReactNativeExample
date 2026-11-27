import type { FavouriteIds, HomeSnapshot } from '../entities/favourites'

export interface HomeState {
  snapshot: HomeSnapshot
  /** false after a failed refresh; `snapshot` then holds the last known data. */
  serverOnline: boolean
  /** true for a real server: nothing can be switched or edited. */
  readOnly?: boolean
}

export interface HomeRepository {
  /** Must return the same reference until something changes. */
  getState(): HomeState
  subscribe(listener: () => void): () => void
  refresh(): Promise<void>
  saveFavourites(favourites: FavouriteIds): void
}
