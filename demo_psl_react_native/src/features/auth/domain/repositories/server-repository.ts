import type { ServerSettings } from '../entities/server'

export interface ServerRepository {
  /** Must return the same reference until it changes. */
  get(): ServerSettings
  save(settings: ServerSettings): void
  subscribe(listener: () => void): () => void
  /** Rejects with a ServerError or AppError when nobody can sign in through this address. */
  verify(url: string): Promise<void>
}
