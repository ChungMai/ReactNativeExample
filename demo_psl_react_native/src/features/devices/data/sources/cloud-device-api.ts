// The real device list. Swift: DeviceMainPagingLoading.getPartialDevices. Read only on purpose.
import { createAuthorizedFetch, type Credentials } from '../../../../shared/data/authorized-fetch'
import { AppError } from '../../../../shared/domain/app-error'
import type { DeviceCategory, ListedDevice } from '../../domain/entities/listed-device'

const FIRST_PAGE = 64
const NEXT_PAGE = 128
const MAX_PAGES = 50 // stops a server that ignores the offset
const FILTER_DEVICES = 23
const HUB_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path

export class CloudDeviceApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    private credentials: Credentials,
    private network: () => { id: string; hub: string } | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  /** Whose devices these are. It changes with the account or network. */
  source = () => `${this.credentials.server()}|${this.network()?.id ?? ''}`

  async fetchDevices(): Promise<ListedDevice[]> {
    const network = this.network()
    if (!network || !HUB_ID.test(network.hub)) throw new AppError('unknown', 'No network is chosen')

    const found = new Map<string, ListedDevice>()
    let offset = 0
    for (let page = 0; page < MAX_PAGES; page++) {
      const size = page === 0 ? FIRST_PAGE : NEXT_PAGE
      const answer = await this.call(`/api/bridge/${network.hub}/accessories`, { '0010': FILTER_DEVICES, '00C5': size, '00C6': offset })
      if (!Array.isArray(answer)) throw new AppError('unknown', 'POST /accessories: the answer is not a list')
      for (const device of answer.flatMap(toDevice)) found.set(device.id, device)
      if (answer.length < size) break
      offset += size
    }
    return [...found.values()]
  }
}

// "0081" id, "008A" name, "0080" type, "0100" on/off, "0103" unreachable.
function toDevice(raw: any): ListedDevice[] {
  const id = raw?.['0081']
  const name = raw?.['008A']
  if (!Number.isInteger(id) || typeof name !== 'string') return []
  const category = categoryOf(raw['0080'])
  const power = raw['0100']
  return [{
    id: String(id),
    name,
    category,
    isOn: power === undefined || category === 'Sensor' || category === 'Meter' ? undefined : Boolean(power),
    unreachable: Boolean(raw['0103']),
  }]
}

// Swift: DeviceCategory.objectTypeIDToControlCategory.
const SENSORS = [784, 800, 816, 832, 848, 864, 880, 881, 882, 883, 884, 885, 887, 888, 889, 890, 896, 928, 944, 960, 976, 992, 1008]

function categoryOf(type: unknown): DeviceCategory {
  if (typeof type !== 'number') return 'Others'
  if (type >= 512 && type <= 516) return 'Lighting'
  if (type >= 1200 && type <= 1204) return 'Curtain'
  if (type >= 1205 && type <= 1208) return 'Blind'
  if ([536, 544, 560].includes(type)) return 'Switch/Plug/Socket/Relay/Button'
  if (SENSORS.includes(type)) return 'Sensor'
  if (type === 545 || type === 817) return 'Meter'
  if (type === 1136) return 'Aircon'
  if (type === 576) return 'Fan'
  if (type === 1109) return 'TV'
  if (type === 1056) return 'Speaker'
  return 'Others'
}
