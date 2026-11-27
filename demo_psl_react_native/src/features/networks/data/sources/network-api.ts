import type { AppError } from '../../../../shared/domain/app-error'
import type { AccessDTO, NetworkListDTO } from '../network-dto'
import { ACCESS_SEED, NETWORK_SEED } from './network-seed'

export interface NetworkApi {
  /** Whether the list can only be read right now. */
  readOnly?(): boolean
  fetchNetworks(): Promise<NetworkListDTO>
  checkAccess(id: string): Promise<AccessDTO>
  requestToJoin(id: string): Promise<void>
  delete(id: string): Promise<void>
  exit(id: string): Promise<void>
}

/** Stub for the cloud and the hubs. It keeps its own copy, so changes survive a refresh. */
export class FakeNetworkApi implements NetworkApi {
  private list: NetworkListDTO

  /** Set `failWith` to an AppError to make requests fail, i.e. "server offline". */
  constructor(public failWith?: AppError, seed: NetworkListDTO = NETWORK_SEED) {
    this.list = seed
  }

  private ensureOnline() {
    if (this.failWith) throw this.failWith
  }

  async fetchNetworks() {
    this.ensureOnline()
    return this.list
  }
  async checkAccess(id: string): Promise<AccessDTO> {
    this.ensureOnline()
    return ACCESS_SEED[id] ?? 'troubleshoot'
  }
  async requestToJoin(id: string) {
    this.ensureOnline()
    this.list = { ...this.list, nearby: this.list.nearby.map(n => (n.network_id === id ? { ...n, request_status: 'pending' } : n)) }
  }
  async delete(id: string) {
    this.remove(id)
  }
  async exit(id: string) {
    this.remove(id)
  }
  private remove(id: string) {
    this.ensureOnline()
    this.list = { ...this.list, joined: this.list.joined.filter(n => n.network_id !== id) }
  }
}
