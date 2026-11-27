import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { ServerSettings } from '../domain/entities/server'
import type { ServerRepository } from '../domain/repositories/server-repository'
import { checkServerAddress } from '../domain/server-address'
import type { TextStorage } from './sources/session-store'

export class StoredServerRepository implements ServerRepository {
  private store: InMemoryStore<ServerSettings>

  constructor(private storage: TextStorage, readonly verify: (url: string) => Promise<void>) {
    this.store = new InMemoryStore(load(storage))
  }

  get = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  save(settings: ServerSettings) {
    try {
      this.storage.write(JSON.stringify(settings))
    } catch (e) {
      console.warn('Could not save the server list', e)
    }
    this.store.set(settings)
  }
}

// What is on disk is untrusted: only addresses that would be accepted today are kept.
function load(storage: TextStorage): ServerSettings {
  try {
    const value = JSON.parse(storage.read() ?? '{}') as { selected?: unknown; saved?: unknown }
    const valid = (url: unknown): url is string => typeof url === 'string' && checkServerAddress(url).url === url
    return {
      selected: valid(value?.selected) ? value.selected : undefined,
      saved: Array.isArray(value?.saved) ? value.saved.filter(valid) : [],
    }
  } catch {
    return { saved: [] }
  }
}
