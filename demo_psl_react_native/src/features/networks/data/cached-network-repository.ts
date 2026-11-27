import { InMemoryStore } from '../../../shared/data/in-memory-store'
import type { AccessMode, ActiveNetwork, NetworkList } from '../domain/entities/network'
import type { NetworkRepository } from '../domain/repositories/network-repository'
import type { NetworkListDTO } from './network-dto'
import type { NetworkApi } from './sources/network-api'

const EMPTY: NetworkList = { joined: [], nearby: [], serverOnline: true, readOnly: false, loaded: false }

function toDomain(dto: NetworkListDTO, modeOf: (id: string) => AccessMode): Pick<NetworkList, 'joined' | 'nearby'> {
  return {
    joined: dto.joined.map(n => ({
      id: n.network_id,
      name: n.network_name,
      role: n.user_role,
      remoteAccessEnabled: n.ras,
      primaryUserCount: n.primary_users,
      mode: modeOf(n.network_id),
    })),
    nearby: dto.nearby.map(n => ({
      id: n.network_id,
      name: n.network_name,
      requestPending: n.request_status === 'pending',
      onCurrentServer: n.same_server,
    })),
  }
}

export class CachedNetworkRepository implements NetworkRepository {
  private list = new InMemoryStore<NetworkList>(EMPTY)
  private active = new InMemoryStore<ActiveNetwork | undefined>(undefined)

  private generation = 0 // an answer that arrives after reset() belongs to the previous user

  constructor(private api: NetworkApi) {}

  getList = () => this.list.get()
  getActive = () => this.active.get()
  setActive = (network: ActiveNetwork | undefined) => this.active.set(network)

  subscribe = (listener: () => void) => {
    const offList = this.list.subscribe(listener)
    const offActive = this.active.subscribe(listener)
    return () => { offList(); offActive() }
  }

  /** Publishes the names first ("Checking..."), then how each joined network can be reached. */
  async refresh() {
    const generation = this.generation
    const readOnly = this.api.readOnly?.() ?? false
    let dto: NetworkListDTO
    try {
      dto = await this.api.fetchNetworks()
    } catch (e) {
      if (generation !== this.generation) return
      this.publish({ ...this.getList(), serverOnline: false, loaded: true })
      throw e
    }
    if (generation !== this.generation) return
    const known = new Map(this.getList().joined.map(n => [n.id, n.mode]))
    this.publish({ ...toDomain(dto, id => known.get(id) ?? 'unknown'), serverOnline: true, readOnly, loaded: true })

    const modes = new Map(await Promise.all(dto.joined.map(async n =>
      [n.network_id, await this.api.checkAccess(n.network_id).catch(() => 'troubleshoot' as const)] as const)))
    if (generation !== this.generation) return
    this.publish({ ...toDomain(dto, id => modes.get(id) ?? 'unknown'), serverOnline: true, readOnly, loaded: true })
  }

  checkAccess = (id: string) => this.api.checkAccess(id)

  /** Forgets everything about the signed-in user. */
  reset() {
    this.generation += 1
    this.list.set(EMPTY)
    this.active.set(undefined)
  }

  async requestToJoin(id: string) {
    await this.api.requestToJoin(id)
    await this.refresh()
  }
  async delete(id: string) {
    await this.api.delete(id)
    await this.refresh()
  }
  async exit(id: string) {
    await this.api.exit(id)
    await this.refresh()
  }

  // Polling usually brings the same data: keep the reference so nothing re-renders.
  private publish(next: NetworkList) {
    if (JSON.stringify(next) !== JSON.stringify(this.getList())) this.list.set(next)
  }
}
