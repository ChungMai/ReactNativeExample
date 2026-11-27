// The real rooms. Swift: RoomAPIService.getAllRoomsOnServer and getRoomMembersOnServer. Read only on purpose.
import type { DeviceKind } from '../../../devices'
import { createAuthorizedFetch, type Credentials } from '../../../../shared/data/authorized-fetch'
import { AppError } from '../../../../shared/domain/app-error'
import type { ListedRoom, RoomMembers } from '../../domain/entities/listed-room'

const GROUP = 512 // "006C" major class: a group, not a room
const HUB_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path

export class CloudRoomApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    private credentials: Credentials,
    private network: () => { id: string; hub: string } | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  /** Whose rooms these are. It changes with the account or network. */
  source = () => `${this.credentials.server()}|${this.network()?.id ?? ''}`

  async fetchRooms(): Promise<ListedRoom[]> {
    const answer = await this.get('/groups/0')
    if (!Array.isArray(answer)) throw new AppError('unknown', 'GET /groups/0: the answer is not a list')
    return answer.filter(raw => raw?.['006C'] !== GROUP).flatMap(toItem)
  }

  async fetchMembers(roomId: string): Promise<RoomMembers> {
    if (!/^\d+$/.test(roomId)) throw new AppError('unknown', 'Not a room id')
    const answer: any = await this.get(`/groups/${roomId}/memberof`)
    const list = (value: unknown) => (Array.isArray(value) ? value : [])
    return {
      devices: list(answer['0064']).flatMap(raw => toItem(raw).map(d => ({ ...d, kind: kindOf(raw['0080']), unreachable: Boolean(raw['0103']) }))),
      // "007F" 0: a preset the user made, not one the app made for itself
      presets: list(answer['0066']).filter((raw: any) => !raw?.['007F']).flatMap(toItem).map(({ id, name }) => ({ id, name })),
    }
  }

  private get(path: string) {
    const network = this.network()
    if (!network || !HUB_ID.test(network.hub)) return Promise.reject(new AppError('unknown', 'No network is chosen'))
    return this.call(`/api/bridge/${network.hub}${path}`)
  }
}

// "0080" object type
function kindOf(type: unknown): DeviceKind {
  if (typeof type !== 'number') return 'plug'
  if (type >= 512 && type <= 516) return 'light'
  if (type === 576) return 'fan'
  if (type >= 1200 && type <= 1208) return 'blind'
  return 'plug'
}

// "0081" id, "008A" name, "0100" on/off. Entries without an id or a name are skipped.
function toItem(raw: any): ListedRoom[] {
  const id = raw?.['0081']
  const name = raw?.['008A']
  if (!Number.isInteger(id) || typeof name !== 'string') return []
  const power = raw['0100']
  return [{ id: String(id), name, isOn: power === undefined ? undefined : Boolean(power) }]
}
