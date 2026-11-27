import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { HomeSnapshot } from '../domain/entities/favourites'
import type { HomeRepository, HomeState } from '../domain/repositories/home-repository'
import type { HomeApi } from './sources/home-api'

const EMPTY: HomeSnapshot = {
  favourites: { device: [], group: [], zone: [], scene: [], preset: [] },
  devices: {}, rooms: [], groups: [], zones: [], scenes: [], presets: [],
  onCounts: { device: 0, room: 0, group: 0, zone: 0 },
}

export class CachedHomeRepository implements HomeRepository {
  private store = new InMemoryStore<HomeState>({ snapshot: EMPTY, serverOnline: true })
  private source?: string

  constructor(private api: HomeApi) {}

  getState = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  async refresh() {
    const source = this.api.source()
    if (source !== this.source) {
      this.source = source
      this.store.set({ snapshot: EMPTY, serverOnline: true }) // never show another account's or network's data
    }
    let snapshot: HomeSnapshot
    try {
      snapshot = await this.api.fetchHome()
    } catch (e) {
      if (source === this.source) this.publish(this.getState().snapshot, false)
      throw e
    }
    if (source === this.source) this.publish(snapshot, true)
  }

  // Polling usually returns the same data: keep the same reference so nothing re-renders.
  private publish(snapshot: HomeSnapshot, serverOnline: boolean) {
    const next = { snapshot, serverOnline }
    if (JSON.stringify(next) !== JSON.stringify(this.getState())) this.store.set(next)
  }
}
