import type { ActiveNetwork, NetworkList } from '../entities/network'

export interface NetworkRepository {
  /** getList() and getActive() must return the same reference until they change. */
  getList(): NetworkList
  getActive(): ActiveNetwork | undefined
  subscribe(listener: () => void): () => void
  refresh(): Promise<void>
  setActive(network: ActiveNetwork | undefined): void
}
