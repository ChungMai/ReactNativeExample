// The groups of the network. Swift: GroupAPIService.getAllGroupsOnServer. Read only on purpose.
import { createAuthorizedFetch, type Credentials } from '../../../../shared/data/authorized-fetch'
import { AppError } from '../../../../shared/domain/app-error'
import type { GroupCategory, ListedGroup } from '../../domain/entities/listed-group'

const ROOM = 768 // "006C" major class: a room, not a group
const HUB_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path

export class CloudGroupApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    private credentials: Credentials,
    private network: () => { id: string; hub: string } | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  /** Whose groups these are. It changes with the account or network. */
  source = () => `${this.credentials.server()}|${this.network()?.id ?? ''}`

  async fetchGroups(): Promise<ListedGroup[]> {
    const network = this.network()
    if (!network || !HUB_ID.test(network.hub)) throw new AppError('unknown', 'No network is chosen')
    const answer = await this.call(`/api/bridge/${network.hub}/groups`)
    if (!Array.isArray(answer)) throw new AppError('unknown', 'GET /groups: the answer is not a list')
    return answer.filter(raw => raw?.['006C'] !== ROOM).flatMap(toGroup)
  }
}

// "0081" id, "008A" name, "0100" on/off or "0108" state.
function toGroup(raw: any): ListedGroup[] {
  const id = raw?.['0081']
  const name = raw?.['008A']
  if (!Number.isInteger(id) || typeof name !== 'string') return []
  const power = raw['0100'] ?? raw['0108']
  return [{ id: String(id), name, category: categoryOf(raw), isOn: power === undefined ? undefined : Boolean(power) }]
}

const PANL_DISPLAYS = [1219, 1220] // PanL 40 and PanL 100
const SENSORS = [784, 800, 816, 832, 848, 864, 880, 881, 882, 883, 884, 885, 887, 888, 889, 890, 896, 928, 944, 960, 976, 992, 1008]
const SWITCHES: GroupCategory = 'Switch/Plug/Socket/Relay/Button'

// Swift: DeviceCategory.objectTypeIDToControlCategory. Blinds are listed with the curtains.
function categoryOfType(type: number): GroupCategory | undefined {
  if (type >= 512 && type <= 516) return 'Lighting'
  if (type >= 1200 && type <= 1208) return 'Curtain'
  if ([536, 544, 560].includes(type)) return SWITCHES
  if (SENSORS.includes(type)) return 'Sensor'
  if (type === 545 || type === 817) return 'Meter'
  if (type === 1136) return 'Aircon'
  if (type === 576) return 'Fan'
  if (type === 1109) return 'TV'
  if (type === 1056) return 'Speaker'
  if (type === 1264) return 'Others'
  return undefined
}

// Swift: DeviceCategory.categoryType(with:).
const CONTROL_CATEGORIES: Record<number, GroupCategory> = {
  1: 'Aircon', 2: 'Curtain', 3: 'Curtain', 4: 'Fan', 5: 'Lighting', 6: 'Sensor', 7: 'Speaker', 9: 'TV', 11: 'Others', 12: 'Meter',
}

const numbers = (value: unknown): number[] => (Array.isArray(value) ? value.filter(Number.isInteger) : [])

// Swift: GroupInfo.groupCategories, from the member types ("00C8") and control categories ("00C9").
// A group of one kind goes to that section; a mixed or unknown one goes to "Others".
function categoryOf(raw: any): GroupCategory {
  const types = numbers(raw['00C8'])
  if (types.length > 0 && types.every(t => PANL_DISPLAYS.includes(t))) return 'PanL Display'

  const controls = numbers(raw['00C9'])
  const found = new Set(controls.map(c => CONTROL_CATEGORIES[c] ?? SWITCHES))
  for (const type of types) {
    const category = categoryOfType(type)
    // a switch says what it controls in the control categories; its type counts only when there are none
    if (category && (category !== SWITCHES || controls.length === 0)) found.add(category)
  }
  return found.size === 1 ? [...found][0] : 'Others'
}
