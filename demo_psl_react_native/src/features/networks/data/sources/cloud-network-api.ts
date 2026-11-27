// The real network list. Swift: NetworkManager.getAllNetworksFromCloud.
// Read only: joining, deleting and leaving are not wired up.
import { AppError } from '../../../../shared/domain/app-error'
import type { NetworkDTO } from '../network-dto'

const TIMEOUT_MS = 15_000

export interface Credentials {
  /** The server the signed-in user belongs to. */
  server(): string | undefined
  accessToken(): Promise<string>
}

export class CloudNetworkApi {
  constructor(
    private credentials: Credentials,
    /** Called when the server no longer accepts the sign-in. */
    private onUnauthorized: (error: unknown) => boolean,
    private request: typeof fetch = (...args) => fetch(...args),
  ) {}

  private hubs = new Map<string, { hub: string; name: string }>()
  /** What the server needs to address a network of the last fetched list. */
  hubOf = (id: string) => this.hubs.get(id)

  async fetchNetworks(): Promise<NetworkDTO[]> {
    const body = await this.get('/app/networks')
    if (!Array.isArray(body)) throw new AppError('unknown', 'GET /app/networks: the answer is not a list')
    this.hubs = new Map(body.flatMap((item: any) => toNetwork(item).map(n => {
      const hub = item.network.primaryHub
      return [n.network_id, { hub: typeof hub === 'string' ? hub : '', name: n.network_name }] as const
    })))
    return body.flatMap(toNetwork)
  }

  private async get(path: string): Promise<unknown> {
    const server = this.credentials.server()
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
    try {
      const token = await this.credentials.accessToken()
      // The token goes only to the server it was issued for.
      const response = await this.request(`${server}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Cache-Control': 'no-cache' },
        signal: abort.signal,
      })
      if (response.status === 401) this.onUnauthorized(undefined)
      if (response.status !== 200) throw new AppError('network', `GET ${path}: HTTP ${response.status}`)
      return await response.json()
    } catch (e) {
      if (e instanceof AppError || this.onUnauthorized(e)) throw e
      throw new AppError(abort.signal.aborted ? 'timeout' : 'network', `GET ${path} failed`, e)
    } finally {
      clearTimeout(timer)
    }
  }
}

// Swift: NetworkInfo / Network / UserInfo mapping. Entries without an id or a name are skipped.
function toNetwork(item: any): NetworkDTO[] {
  const id = item?.network?._id ?? item?.network?.primaryHub
  const name = item?.network?.networkName
  if (typeof id !== 'string' || typeof name !== 'string') return []
  const role = item.userProfile?.userRole ?? item.userRole
  return [{
    network_id: id,
    network_name: name,
    user_role: role === 'secondary' ? 'secondary' : 'primary',
    ras: item.userProfile?.ras === true,
  }]
}
