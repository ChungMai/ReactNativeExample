import { InMemoryStore } from '../../../../shared/data/in-memory-store'
import type { Session } from '../../domain/entities/session'

export interface StoredAuth {
  session?: Session
  lastEmail?: string
}

export interface SessionStore {
  get(): StoredAuth
  set(value: StoredAuth): void
  subscribe(listener: () => void): () => void
}

/** Memory only: for tests. */
export class InMemorySessionStore implements SessionStore {
  private store: InMemoryStore<StoredAuth>
  constructor(initial: StoredAuth = {}) {
    this.store = new InMemoryStore(initial)
  }
  get = () => this.store.get()
  set = (value: StoredAuth) => this.store.set(value)
  subscribe = (listener: () => void) => this.store.subscribe(listener)
}

/** Where the session is kept between app launches. */
export interface TextStorage {
  read(): string | null
  write(value: string): void
}

/**
 * Reads the storage once, then serves from memory (get() must stay referentially stable).
 * If the storage fails (locked keychain, private window), the session lasts until the app closes.
 */
export class PersistentSessionStore implements SessionStore {
  private memory: InMemorySessionStore

  constructor(private storage: TextStorage) {
    this.memory = new InMemorySessionStore(load(storage))
  }

  get = () => this.memory.get()
  subscribe = (listener: () => void) => this.memory.subscribe(listener)

  set(value: StoredAuth) {
    try {
      this.storage.write(JSON.stringify(value))
    } catch (e) {
      console.warn('Could not save the session', e)
    }
    this.memory.set(value)
  }
}

// What is on disk is untrusted: anything unexpected means "signed out".
function load(storage: TextStorage): StoredAuth {
  try {
    const value: unknown = JSON.parse(storage.read() ?? '{}')
    const { session, lastEmail } = (value ?? {}) as Record<string, unknown>
    return {
      session: isSession(session) ? session : undefined,
      lastEmail: typeof lastEmail === 'string' ? lastEmail : undefined,
    }
  } catch {
    return {}
  }
}

function isSession(value: unknown): value is Session {
  const s = value as Partial<Session> | null | undefined
  return typeof s?.email === 'string' && Number.isFinite(s.signedInAt) && typeof s.keepSignedIn === 'boolean'
}
