import type { HomeSnapshot } from '../../domain/entities/favourites'

export interface HomeApi {
  fetchHome(): Promise<HomeSnapshot>
  /** Whose data this is. It changes with the account or network. */
  source(): string
}
