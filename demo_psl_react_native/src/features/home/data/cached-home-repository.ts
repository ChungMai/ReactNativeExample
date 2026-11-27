import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { FavouriteIds } from '../domain/entities/favourites'
import type { HomeRepository, HomeState } from '../domain/repositories/home-repository'
import type { HomeDTO } from './dto/home-dto'
import { HOME_SEED } from './home-seed'
import { favouritesToDTO, homeToDomain } from './mappers/home-mapper'
import type { HomeApi } from './sources/home-api'

export class CachedHomeRepository implements HomeRepository {
  private dto: HomeDTO
  private store: InMemoryStore<HomeState>
  // The API stub has no write endpoint: once favourites are edited, a refresh must not undo them.
  private hasLocalFavourites = false

  /** `cached` is what the UI shows before the first fetch (the Swift app reads it from disk). */
  constructor(private api: HomeApi, cached: HomeDTO = HOME_SEED) {
    this.dto = cached
    this.store = new InMemoryStore<HomeState>({ snapshot: homeToDomain(cached), serverOnline: true })
  }

  getState = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  async refresh() {
    let fetched: HomeDTO
    try {
      fetched = await this.api.fetchHome()
    } catch (e) {
      this.publish(this.dto, false)
      throw e
    }
    this.publish(this.hasLocalFavourites ? { ...fetched, favourites: this.dto.favourites } : fetched, true)
  }

  saveFavourites(favourites: FavouriteIds) {
    this.hasLocalFavourites = true
    this.publish({ ...this.dto, favourites: favouritesToDTO(favourites) }, this.getState().serverOnline)
  }

  // Polling usually returns the same data: keep the same reference so nothing re-renders.
  private publish(dto: HomeDTO, serverOnline: boolean) {
    const unchanged = JSON.stringify(dto) === JSON.stringify(this.dto)
    if (unchanged && serverOnline === this.getState().serverOnline) return
    const snapshot = unchanged ? this.getState().snapshot : homeToDomain(dto)
    this.dto = dto
    this.store.set({ snapshot, serverOnline })
  }
}
