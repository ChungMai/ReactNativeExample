// The real Home data. Swift: HomeMainViewPresenter.getNetworkDetails and getDetailFavoriteObject.
// Read only on purpose: nothing here switches a device or changes favourites.
import { createAuthorizedFetch, type Credentials } from '../../../../shared/data/authorized-fetch'
import { AppError } from '../../../../shared/domain/app-error'
import type { HomeSnapshot } from '../../domain/entities/favourites'
import { toHomeSnapshot } from '../mappers/cloud-home-mapper'
import type { HomeApi } from './home-api'

const BATCH = 128 // the objects request takes at most this many favourites
const HUB_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path

// Swift: PredefinedAttributes and getActiveObjectTypeID (which types count as "switched on").
const ACTIVE_TYPES = [
  1200, 1201, 1202, 1206, 1205, 560, 784, 800, 816, 832, 848, 864, 880, 896, 928, 944, 960, 976, 992,
  881, 882, 883, 884, 885, 1008, 890, 889, 888, 887, 512, 513, 514, 515, 1136, 576, 1109, 1056, 516,
  1024, 536, 544, 1264, 545, 817,
]

/** The network chosen in the list, with what the server needs to address it. */
export interface ChosenNetwork {
  id: string
  hub: string
  name: string
}

type FavouriteList = Record<'devices' | 'rooms' | 'groups' | 'zones' | 'scenes' | 'presets', number[]>

export class CloudHomeApi implements HomeApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    private credentials: Credentials,
    private network: () => ChosenNetwork | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  source() {
    return `${this.credentials.server()}|${this.network()?.id ?? ''}`
  }

  async fetchHome(): Promise<HomeSnapshot> {
    const network = this.network()
    if (!network || !HUB_ID.test(network.hub)) throw new AppError('unknown', 'No network is chosen')

    const query = `networkName=${encodeURIComponent(network.name)}&primaryHub=${encodeURIComponent(network.hub)}`
    const details: any = await this.call(`/app/networks/users/?${query}`)
    const favourites = toFavourites(details?.userProfile?.favourites)

    const answers: any[] = []
    for (const batch of batches(favourites)) {
      answers.push(await this.call(`/api/bridge/${network.hub}/objects`, objectsRequest(batch)))
    }
    return toHomeSnapshot(details.userProfile, favourites, answers)
  }
}

const ids = (value: unknown): number[] => (Array.isArray(value) ? value.filter(Number.isInteger) : [])

function toFavourites(value: any): FavouriteList {
  return {
    devices: ids(value?.devices), rooms: ids(value?.rooms), groups: ids(value?.groups),
    zones: ids(value?.zones), scenes: ids(value?.scenes), presets: ids(value?.presets),
  }
}

/** At least one batch: the answer also carries the "switched on" counts. */
function batches(favourites: FavouriteList): FavouriteList[] {
  const all = (Object.keys(favourites) as (keyof FavouriteList)[])
    .flatMap(kind => favourites[kind].map(id => ({ kind, id })))
  return Array.from({ length: Math.max(1, Math.ceil(all.length / BATCH)) }, (_, page) => {
    const batch = toFavourites(undefined)
    for (const { kind, id } of all.slice(page * BATCH, (page + 1) * BATCH)) batch[kind].push(id)
    return batch
  })
}

// Swift: prepareJsonToGetActiveAndFavouriteMembers. "0010": 8 = get list, "0011": 17 = brief info.
function objectsRequest(f: FavouriteList) {
  const members: [string, number[]][] = [
    ['006A', f.devices], ['0065', [...f.rooms, ...f.groups]], ['0060', f.zones], ['0066', f.presets], ['0068', f.scenes],
  ]
  return {
    '0010': 8,
    '0011': 17,
    '0100': { on: { '0080': ACTIVE_TYPES } },
    ...Object.fromEntries(members.filter(([, list]) => list.length > 0)),
  }
}
