// What is behind the More menu. Read only on purpose.
import { createAuthorizedFetch, type Credentials } from '../../../shared/data/authorized-fetch'
import { AppError } from '../../../shared/domain/app-error'
import type { MoreObject } from '../domain/more-sections'

const HUB_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path
const FILTER_DEVICES = 23
const PAGE = 128
const MAX_PAGES = 50

// Swift: AccessoriesID and DeviceCategories.
const PANL_HUB = 257
const DISPLAYS = [1216, 1217, 1218, 1219, 1220]
const ACCESSORIES = [
  265, 272, 264, 274, 276, 277, 279, 282, 281, 280, 283, 284, 285, 286, 287, 296, 297, 289, 290, 291, 292, 258, 288,
  293, 294, 295, 298, 304, 306,
]
const POWER_METER = 545

export interface MoreNetwork {
  id: string
  hub: string
  name: string
  role: 'primary' | 'secondary'
}

export class CloudMoreApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    private credentials: Credentials,
    private network: () => MoreNetwork | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  /** Whose data this is. It changes with the account or network. */
  source = () => `${this.credentials.server()}|${this.network()?.id ?? ''}`

  async fetchObjects(section: string): Promise<MoreObject[]> {
    switch (section) {
      // "0100" on/off, "0071" event enabled, "007F" made by the app for itself
      case 'zones': return this.named('/zones', { state: '0100' })
      case 'presets': return this.named('/presets', { keep: raw => raw['007F'] !== 1 })
      case 'scenes': return this.named('/scenes', { keep: raw => !raw['007F'] })
      case 'events': return this.named('/events', { state: '0071' })
      case 'hubs': return this.named('/hubs', {})
      // Swift: PanLAccessoriesPresenter takes the accessory types out of the hub list.
      case 'accessories': return this.named('/hubs', { keep: raw => ACCESSORIES.includes(raw['0080']) })
      case 'displays': return sortByName((await this.devicesOfTypes(DISPLAYS)).flatMap(raw => toObject(raw)))
      case 'users': return this.users()
      case 'network-settings': return this.networkInfo()
      default: throw new AppError('unknown', `No list for ${section}`)
    }
  }

  /** The energy meters of the network. */
  async energyMeters(): Promise<MoreObject[]> {
    return sortByName((await this.devicesOfTypes([POWER_METER])).flatMap(raw => toObject(raw)))
  }

  private chosen(): MoreNetwork {
    const network = this.network()
    if (!network || !HUB_ID.test(network.hub)) throw new AppError('unknown', 'No network is chosen')
    return network
  }

  private async list(path: string, body?: object): Promise<any[]> {
    const answer = await this.call(path, body)
    if (!Array.isArray(answer)) throw new AppError('unknown', `${path}: the answer is not a list`)
    return answer
  }

  private async named(path: string, options: { keep?: (raw: any) => boolean; state?: string }) {
    const answer = await this.list(`/api/bridge/${this.chosen().hub}${path}`)
    return sortByName(answer.flatMap(raw => (options.keep?.(raw) === false ? [] : toObject(raw, options.state))))
  }

  private async devicesOfTypes(types: number[]): Promise<any[]> {
    const path = `/api/bridge/${this.chosen().hub}/accessories`
    const found: any[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const answer = await this.list(path, { '0010': FILTER_DEVICES, '00C5': PAGE, '00C6': page * PAGE, '0080': types })
      found.push(...answer)
      if (answer.length < PAGE) break
    }
    return found
  }

  // Swift: UsersViewPresenter.fetchUsersListFromNetwork. This path also changes users with other bodies:
  // only ever send the network here.
  private async users(): Promise<MoreObject[]> {
    const { name, hub } = this.chosen()
    const answer = await this.list('/app/networks/users/all', { network: { networkName: name, primaryHub: hub } })
    return sortByName(answer.flatMap((raw: any, index: number): MoreObject[] => {
      const email = raw?.user?.email
      const userName = raw?.user?.userName || email
      if (typeof userName !== 'string') return []
      const role = (raw.userProfile?.userRole ?? raw.userRole) === 'secondary' ? 'Secondary' : 'Primary'
      const remote = (raw.userProfile?.ras ?? raw.ras) === true ? 'Remote access' : 'No remote access'
      return [{ id: String(raw._id ?? email ?? index), name: userName, detail: [email, role, remote].filter(Boolean).join(' · ') }]
    }))
  }

  // Swift: PSLPanlNetworkInfoPresenter. "2415" hub role, "2413" time zone, "008C" hub id.
  private async networkInfo(): Promise<MoreObject[]> {
    const network = this.chosen()
    const hubs = (await this.list(`/api/bridge/${network.hub}/hubs`)).filter(raw => raw?.['0080'] === PANL_HUB)
    const primary = hubs.filter(raw => raw['2415'] === 'primary')
    const zone = (primary.find(raw => raw['008C'] === network.hub) ?? primary[0])?.['2413']
    const row = (name: string, detail: string) => ({ id: name, name, detail })
    return [
      row('Network name', network.name),
      row('Network ID', network.id),
      row('Your role', network.role === 'primary' ? 'Primary user' : 'Secondary user'),
      row('Time zone', typeof zone === 'string' ? zone : 'Not reported'),
      row('PanL Hubs', `${hubs.length} (${primary.length} primary and ${hubs.filter(raw => raw['2415'] === 'secondary').length} secondary)`),
    ]
  }
}

// "0081" id, "008A" name, "0103" unreachable. Entries without an id or a name are skipped.
function toObject(raw: any, stateKey?: string): MoreObject[] {
  const id = raw?.['0081']
  const name = raw?.['008A']
  if (!Number.isInteger(id) || typeof name !== 'string') return []
  const state = stateKey ? raw[stateKey] : undefined
  return [{
    id: String(id),
    name,
    isOn: state === undefined ? undefined : Boolean(state),
    note: raw['0103'] ? 'Unreachable' : undefined,
  }]
}

function sortByName(objects: MoreObject[]) {
  return objects.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
}
