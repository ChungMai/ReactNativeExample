import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { FavouriteIds } from '../domain/entities/favourites'
import type { HomeRepository, HomeState } from '../domain/repositories/home-repository'
import type { HomeDTO } from './dto/home-dto'
import { HOME_SEED } from './home-seed'
import { favouritesToDTO, homeToDomain } from './mappers/home-mapper'
import type { HomeApi } from './sources/home-api'

// Shown while a real home loads, so that demo data is never mistaken for it.
const EMPTY: HomeDTO = {
  network: { network_name: '', access_mode: 'remote', user_role: 'secondary' },
  favourites: { devices: [], groups: [], zones: [], scenes: [], presets: [] },
  groups: [], zones: [], scenes: [], presets: [],
  live: { devices: [], rooms: [], on_counts: { device: 0, room: 0, group: 0, zone: 0 } },
}

export class CachedHomeRepository implements HomeRepository {
  private dto: HomeDTO
  private store: InMemoryStore<HomeState>
  // The API stub has no write endpoint: once favourites are edited, a refresh must not undo them.
  private hasLocalFavourites = false
  private source?: string

  /** `cached` is what the UI shows before the first fetch (the Swift app reads it from disk). */
  constructor(private api: HomeApi, private seed: HomeDTO = HOME_SEED) {
    const cached = seed
    this.dto = cached
    this.store = new InMemoryStore<HomeState>({ snapshot: homeToDomain(cached), serverOnline: true })
  }

  getState = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  async refresh() {
    const source = this.api.source?.()
    if (source !== this.source) this.switchTo(source)
    let fetched: HomeDTO
    try {
      fetched = await this.api.fetchHome()
    } catch (e) {
      if (source === this.source) this.publish(this.dto, false)
      throw e
    }
    if (source !== this.source) return // an answer about the previous account or network
    this.publish(this.hasLocalFavourites ? { ...fetched, favourites: this.dto.favourites } : fetched, true)
  }

  /** Forgets the data of the previous account or network. */
  private switchTo(source: string | undefined) {
    this.source = source
    this.hasLocalFavourites = false
    this.dto = source === undefined ? this.seed : EMPTY
    this.store.set({ snapshot: homeToDomain(this.dto), serverOnline: true, readOnly: this.api.readOnly?.() })
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
    this.store.set({ snapshot, serverOnline, readOnly: this.api.readOnly?.() })
  }
}
