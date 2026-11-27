import { InMemoryStore } from '../../../shared/data/in-memory-store'
import { toAppError } from '../../../shared/domain/app-error'
import type { MoreObject } from '../domain/more-sections'

export interface ObjectList {
  objects: MoreObject[]
  /** false after a failed refresh; `objects` then holds the last known data. */
  serverOnline: boolean
}

export interface ObjectSource {
  source(): string
  fetchObjects(section: string): Promise<MoreObject[]>
}

/** The lists of the chosen network, keyed by section; a missing key is not loaded yet. */
export class ServerObjectLists {
  private store = new InMemoryStore<Record<string, ObjectList>>({})
  private source?: string

  constructor(private api: ObjectSource) {}

  get = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  /** Throws an AppError. */
  refresh = async (section: string): Promise<void> => {
    const source = this.api.source()
    if (source !== this.source) {
      this.source = source
      this.store.set({}) // never show the data of another account or network
    }
    try {
      const objects = await this.api.fetchObjects(section)
      if (source === this.source) this.publish(section, { objects, serverOnline: true })
    } catch (e) {
      if (source === this.source) this.publish(section, { objects: this.get()[section]?.objects ?? [], serverOnline: false })
      throw toAppError(e)
    }
  }

  private publish(section: string, list: ObjectList) {
    if (JSON.stringify(list) !== JSON.stringify(this.get()[section])) this.store.set({ ...this.get(), [section]: list })
  }
}
