import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { ActiveNetwork, NetworkList } from '../domain/entities/network'
import type { NetworkRepository } from '../domain/repositories/network-repository'
import type { NetworkDTO } from './network-dto'

const EMPTY: NetworkList = { joined: [], serverOnline: true, loaded: false }

export interface NetworkSource {
  fetchNetworks(): Promise<NetworkDTO[]>
}

export class CachedNetworkRepository implements NetworkRepository {
  private list = new InMemoryStore<NetworkList>(EMPTY)
  private active = new InMemoryStore<ActiveNetwork | undefined>(undefined)

  private generation = 0 // an answer that arrives after reset() belongs to the previous user

  constructor(private api: NetworkSource) {}

  getList = () => this.list.get()
  getActive = () => this.active.get()
  setActive = (network: ActiveNetwork | undefined) => this.active.set(network)

  subscribe = (listener: () => void) => {
    const offList = this.list.subscribe(listener)
    const offActive = this.active.subscribe(listener)
    return () => { offList(); offActive() }
  }

  async refresh() {
    const generation = this.generation
    let dtos: NetworkDTO[]
    try {
      dtos = await this.api.fetchNetworks()
    } catch (e) {
      if (generation !== this.generation) return
      this.publish({ ...this.getList(), serverOnline: false, loaded: true })
      throw e
    }
    if (generation !== this.generation) return
    const joined = dtos.map(n => ({ id: n.network_id, name: n.network_name, role: n.user_role, remoteAccessEnabled: n.ras }))
    this.publish({ joined, serverOnline: true, loaded: true })
  }

  /** Forgets everything about the signed-in user. */
  reset() {
    this.generation += 1
    this.list.set(EMPTY)
    this.active.set(undefined)
  }

  // Polling usually brings the same data: keep the reference so nothing re-renders.
  private publish(next: NetworkList) {
    if (JSON.stringify(next) !== JSON.stringify(this.getList())) this.list.set(next)
  }
}
