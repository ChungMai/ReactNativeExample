import type { AccessMode, ActiveNetwork, NetworkList } from '../entities/network'

export interface NetworkRepository {
  /** getList() and getActive() must return the same reference until they change. */
  getList(): NetworkList
  getActive(): ActiveNetwork | undefined
  subscribe(listener: () => void): () => void
  refresh(): Promise<void>
  checkAccess(id: string): Promise<AccessMode>
  requestToJoin(id: string): Promise<void>
  delete(id: string): Promise<void>
  exit(id: string): Promise<void>
  setActive(network: ActiveNetwork | undefined): void
}
