// The server's answers → HomeDTO. Swift: HomeInfo.mapping and PSLHomeCustomizationData.mapping.
// "0081" id, "008A" name, "0080" type, "006C" major class, "0100" on/off, "007F" local preset or scene.
import type { DeviceKind } from '../../../devices'
import type { HomeDTO } from '../dto/home-dto'

const ROOM = 768
const GROUP = 512
const SECTION_KINDS = ['scene', 'device', 'room', 'group', 'zone', 'preset'] as const
const SUMMARY_KINDS = ['device', 'room', 'group', 'zone'] as const

interface Item { id: string; name: string; raw: any }

/** Entries without an id or a name are skipped, and so are repeats. */
function itemsOf(answers: any[], key: string): Item[] {
  const found = new Map<string, Item>()
  for (const raw of answers.flatMap(a => (Array.isArray(a?.[key]) ? a[key] : []))) {
    const id = raw?.['0081']
    const name = raw?.['008A']
    if (Number.isInteger(id) && typeof name === 'string') found.set(String(id), { id: String(id), name, raw })
  }
  return [...found.values()]
}

const isOn = (raw: any): boolean | undefined => (raw?.['0100'] === undefined ? undefined : Boolean(raw['0100']))
const count = (value: unknown) => (typeof value === 'number' ? value : 0)

function kindOf(type: unknown): DeviceKind {
  if (typeof type !== 'number') return 'plug'
  if (type >= 512 && type <= 516) return 'light'
  if (type === 576) return 'fan'
  if (type >= 1200 && type <= 1208) return 'blind'
  return 'plug' // the demo has no icon for the other types
}

type Customization = NonNullable<HomeDTO['customization']>

function toCustomization(value: any): HomeDTO['customization'] {
  if (!value) return undefined
  const sections: any[] = (Array.isArray(value.favoriteSections) ? value.favoriteSections : [])
    .filter((s: any) => SECTION_KINDS.includes(s?.favouriteType))
  const summary = value.summarySection
  const layout = value.layout === 'customLayout' ? 'customLayout' : 'defaultLayout'
  const positions: any[] = layout === 'customLayout'
    ? value.itemsPosition ?? []
    : sections.flatMap(s => s.itemsPosition ?? [])

  return {
    layout,
    favourite_sections: sections.map((s): Customization['favourite_sections'][number] => ({
      type: s.favouriteType,
      name: typeof s.sectionName === 'string' ? s.sectionName : '',
      is_hidden: s.isHiddenFavourite === true,
    })),
    summary: {
      is_hidden: summary?.isHidden === true,
      items: (Array.isArray(summary?.summarySectionItems) ? summary.summarySectionItems : [])
        .filter((i: any) => SUMMARY_KINDS.includes(i?.categoryType))
        .map((i: any) => ({ type: i.categoryType, is_hidden: i.isHidden === true })),
    },
    items_position: positions
      .filter(p => Number.isInteger(p?.instanceID) && Number.isInteger(p?.position))
      .map(p => ({ id: String(p.instanceID), position: p.position })),
  }
}

export function toHomeDTO(
  networkName: string,
  profile: any,
  favourites: Record<'devices' | 'rooms' | 'groups' | 'zones' | 'scenes' | 'presets', number[]>,
  answers: any[],
): HomeDTO {
  const groupsAndRooms = itemsOf(answers, '0065')
  const groups = groupsAndRooms.filter(i => i.raw['006C'] === GROUP)
  const on = answers[0]?.['0100']?.on
  const collection = (i: Item) => ({ id: i.id, name: i.name, device_ids: [], is_on: isOn(i.raw) })
  const scene = (i: Item) => ({ id: i.id, name: i.name, actions: [] })

  return {
    network: {
      network_name: networkName,
      access_mode: 'remote',
      user_role: profile?.userRole === 'secondary' ? 'secondary' : 'primary',
    },
    favourites: {
      devices: favourites.devices.map(String),
      groups: favourites.groups.map(String),
      zones: favourites.zones.map(String),
      scenes: favourites.scenes.map(String),
      presets: favourites.presets.map(String),
    },
    groups: groups.map(collection),
    zones: itemsOf(answers, '0060').map(collection),
    scenes: itemsOf(answers, '0068').filter(i => !i.raw['007F']).map(scene),
    presets: itemsOf(answers, '0066').filter(i => i.raw['007F'] !== 1).map(scene),
    customization: toCustomization(profile?.homeCustomization),
    live: {
      devices: itemsOf(answers, '006A')
        .map(i => ({ id: i.id, name: i.name, kind: kindOf(i.raw['0080']), is_on: isOn(i.raw) === true })),
      rooms: groupsAndRooms.filter(i => i.raw['006C'] === ROOM).map(i => ({ id: i.id, name: i.name, is_on: isOn(i.raw) })),
      on_counts: {
        device: count(on?.['0064']),
        room: count(on?.['0065.0300']),
        group: count(on?.['0065.0200']),
        zone: count(on?.['0060']),
      },
    },
  }
}
