// The real network list. Swift: NetworkManager.getAllNetworksFromCloud.
// Read only on purpose: deleting or leaving a real network is not wired up.
import { AppError } from '../../../../shared/domain/app-error'
import type { AccessDTO, NetworkListDTO } from '../network-dto'
import type { NetworkApi } from './network-api'

const TIMEOUT_MS = 15_000

export interface Credentials {
  /** The server the signed-in user belongs to. */
  server(): string | undefined
  accessToken(): Promise<string>
}

export class CloudNetworkApi implements NetworkApi {
  constructor(
    private credentials: Credentials,
    /** Called when the server no longer accepts the sign-in. */
    private onUnauthorized: (error: unknown) => boolean,
    private request: typeof fetch = (...args) => fetch(...args),
  ) {}

  readOnly = () => true

  async fetchNetworks(): Promise<NetworkListDTO> {
    const body = await this.get('/app/networks')
    if (!Array.isArray(body)) throw new AppError('unknown', 'GET /app/networks: the answer is not a list')
    return { joined: body.flatMap(toJoined), nearby: [] } // "nearby" needs local discovery
  }

  // Local access needs discovery on the LAN, which this app does not have: everything is remote.
  async checkAccess(): Promise<AccessDTO> {
    return 'remote'
  }

  async requestToJoin(): Promise<void> { throw readOnlyError() }
  async delete(): Promise<void> { throw readOnlyError() }
  async exit(): Promise<void> { throw readOnlyError() }

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

const readOnlyError = () => new AppError('unknown', 'The real network list is read only')

// Swift: NetworkInfo / Network / UserInfo mapping. Entries without an id or a name are skipped.
function toJoined(item: any): NetworkListDTO['joined'] {
  const id = item?.network?._id ?? item?.network?.primaryHub
  const name = item?.network?.networkName
  if (typeof id !== 'string' || typeof name !== 'string') return []
  const role = item.userProfile?.userRole ?? item.userRole
  const primaryUsers = item.numberOfPrimaryUser
  return [{
    network_id: id,
    network_name: name,
    user_role: role === 'secondary' ? 'secondary' : 'primary',
    ras: item.userProfile?.ras === true,
    primary_users: typeof primaryUsers === 'number' ? primaryUsers : 1,
  }]
}
