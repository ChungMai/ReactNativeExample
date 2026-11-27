import { InMemoryStore } from '../../../shared/data/in-memory-store'
import { toAppError } from '../../../shared/domain/app-error'
import type { GroupList, ListedGroup } from '../domain/entities/listed-group'

const EMPTY: GroupList = { groups: [], loaded: false, serverOnline: true }

export interface GroupSource {
  source(): string
  fetchGroups(): Promise<ListedGroup[]>
}

/** The groups of the chosen network. */
export class ServerGroupList {
  private store = new InMemoryStore<GroupList>(EMPTY)
  private source?: string

  constructor(private api: GroupSource) {}

  get = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  /** Throws an AppError. */
  refresh = async (): Promise<void> => {
    const source = this.api.source()
    if (source !== this.source) {
      this.source = source
      this.store.set(EMPTY) // never show the groups of another account or network
    }
    try {
      const groups = await this.api.fetchGroups()
      if (source === this.source) this.publish({ groups, loaded: true, serverOnline: true })
    } catch (e) {
      if (source === this.source) this.publish({ ...this.get(), loaded: true, serverOnline: false })
      throw toAppError(e)
    }
  }

  // Polling usually brings the same data: keep the reference so nothing re-renders.
  private publish(next: GroupList) {
    if (JSON.stringify(next) !== JSON.stringify(this.get())) this.store.set(next)
  }
}
