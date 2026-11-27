// The server's answers → HomeSnapshot. Swift: HomeInfo.mapping and PSLHomeCustomizationData.mapping.
// "0081" id, "008A" name, "0080" type, "006C" major class, "0100" on/off, "007F" local preset or scene.
import type { DeviceKind } from '../../../devices'
import type { HomeCustomization, HomeSnapshot } from '../../domain/entities/favourites'

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
  return 'plug' // there is no icon for the other types
}

function toCustomization(value: any): HomeCustomization | undefined {
  if (!value) return undefined
  const sections: any[] = (Array.isArray(value.favoriteSections) ? value.favoriteSections : [])
    .filter((s: any) => SECTION_KINDS.includes(s?.favouriteType))
  const summary = value.summarySection
  const layout = value.layout === 'customLayout' ? 'custom' : 'default'
  const positions: any[] = layout === 'custom' ? value.itemsPosition ?? [] : sections.flatMap(s => s.itemsPosition ?? [])

  return {
    layout,
    sections: sections.map(s => ({
      kind: s.favouriteType,
      title: typeof s.sectionName === 'string' ? s.sectionName : '',
      hidden: s.isHiddenFavourite === true,
    })),
    summary: {
      hidden: summary?.isHidden === true,
      items: (Array.isArray(summary?.summarySectionItems) ? summary.summarySectionItems : [])
        .filter((i: any) => SUMMARY_KINDS.includes(i?.categoryType))
        .map((i: any) => ({ kind: i.categoryType, hidden: i.isHidden === true })),
    },
    itemPositions: positions
      .filter(p => Number.isInteger(p?.instanceID) && Number.isInteger(p?.position))
      .map(p => ({ id: String(p.instanceID), position: p.position })),
  }
}

const unique = (ids: number[]) => [...new Set(ids.map(String))]

export function toHomeSnapshot(
  profile: any,
  favourites: Record<'devices' | 'rooms' | 'groups' | 'zones' | 'scenes' | 'presets', number[]>,
  answers: any[],
): HomeSnapshot {
  const groupsAndRooms = itemsOf(answers, '0065')
  const on = answers[0]?.['0100']?.on
  const switchable = (i: Item) => ({ id: i.id, name: i.name, isOn: isOn(i.raw) })
  const named = ({ id, name }: Item) => ({ id, name })

  return {
    favourites: {
      device: unique(favourites.devices),
      group: unique(favourites.groups),
      zone: unique(favourites.zones),
      scene: unique(favourites.scenes),
      preset: unique(favourites.presets),
    },
    devices: Object.fromEntries(itemsOf(answers, '006A')
      .map(i => [i.id, { id: i.id, name: i.name, kind: kindOf(i.raw['0080']), on: isOn(i.raw) === true }])),
    rooms: groupsAndRooms.filter(i => i.raw['006C'] === ROOM).map(switchable),
    groups: groupsAndRooms.filter(i => i.raw['006C'] === GROUP).map(switchable),
    zones: itemsOf(answers, '0060').map(switchable),
    scenes: itemsOf(answers, '0068').filter(i => !i.raw['007F']).map(named),
    presets: itemsOf(answers, '0066').filter(i => i.raw['007F'] !== 1).map(named),
    onCounts: {
      device: count(on?.['0064']),
      room: count(on?.['0065.0300']),
      group: count(on?.['0065.0200']),
      zone: count(on?.['0060']),
    },
    customization: toCustomization(profile?.homeCustomization),
  }
}
