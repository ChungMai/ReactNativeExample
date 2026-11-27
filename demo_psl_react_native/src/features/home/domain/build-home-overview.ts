// Swift: HomeMainViewPresenter.makeActiveAccessoriesInfo / sortItem and PSLHomeCustomizationData.
import type { DeviceMap } from '../../devices'
import type { Room } from '../../rooms'
import { FAVOURITE_KINDS, type FavouriteKind, type HomeCustomization, type HomeSnapshot, type SummaryKind } from './entities/favourites'
import type { HomeItem, HomeOverview, HomeSection, SummaryCount } from './entities/home-overview'

export interface HomeContent {
  snapshot: HomeSnapshot
  rooms: Room[]
  devices: DeviceMap
}

const DEFAULT_SUMMARY: SummaryKind[] = ['device', 'room', 'group', 'zone']

/** undefined when there is no device to switch. */
export function anyOn(deviceIds: string[], devices: DeviceMap): boolean | undefined {
  const known = deviceIds.filter(id => devices[id])
  return known.length === 0 ? undefined : known.some(id => devices[id].on)
}

/** Alphabetical, then the items the user placed by hand are moved to their position. */
export function sortItems(items: HomeItem[], positions: HomeCustomization['itemPositions'] = []): HomeItem[] {
  const byName = [...items].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  const result = byName.filter(item => !positions.some(p => p.id === item.id))
  for (const { id, position } of [...positions].sort((a, b) => a.position - b.position)) {
    const item = byName.find(i => i.id === id)
    if (item) result.splice(position, 0, item) // a position past the end appends
  }
  return result
}

function favouritesOf(kind: FavouriteKind, { snapshot, rooms, devices }: HomeContent): HomeItem[] {
  // A favourite id that no longer exists (deleted object) is skipped.
  const pick = <T extends { id: string }>(ids: string[], all: T[]) => all.filter(x => ids.includes(x.id))
  const { favourites, live } = snapshot
  if (live) devices = live.devices

  switch (kind) {
    case 'device':
      return favourites.device
        .filter(id => devices[id])
        .map(id => ({ kind, id, name: devices[id].name, isOn: devices[id].on, deviceKind: devices[id].kind }))
    case 'room':
      if (live) return live.rooms.map(r => ({ kind, id: r.id, name: r.name, isOn: r.isOn }))
      return rooms.filter(r => r.favourite).map(r => ({ kind, id: r.id, name: r.name, isOn: anyOn(r.deviceIds, devices) }))
    case 'group':
    case 'zone':
      return pick(favourites[kind], kind === 'group' ? snapshot.groups : snapshot.zones)
        .map(c => ({ kind, id: c.id, name: c.name, isOn: c.isOn ?? anyOn(c.deviceIds, devices) }))
    case 'scene':
    case 'preset':
      return pick(favourites[kind], kind === 'scene' ? snapshot.scenes : snapshot.presets)
        .map(s => ({ kind, id: s.id, name: s.name }))
  }
}

function summaryOf({ snapshot, rooms, devices }: HomeContent): SummaryCount[] {
  const counts: Record<SummaryKind, number> = snapshot.live?.onCounts ?? {
    device: Object.values(devices).filter(d => d.on).length,
    room: rooms.filter(r => anyOn(r.deviceIds, devices)).length,
    group: snapshot.groups.filter(g => anyOn(g.deviceIds, devices)).length,
    zone: snapshot.zones.filter(z => anyOn(z.deviceIds, devices)).length,
  }
  const { customization } = snapshot
  const custom = customization?.summary.items ?? []
  if (custom.length > 0 && customization?.layout === 'custom' && customization.summary.hidden) return []

  const kinds = custom.length > 0 ? custom.filter(i => !i.hidden).map(i => i.kind) : DEFAULT_SUMMARY
  return kinds.map(kind => ({ kind, count: counts[kind] }))
}

export function buildHomeOverview(content: HomeContent): HomeOverview {
  const { customization } = content.snapshot
  const settings = customization?.sections ?? []
  const rank = (kind: FavouriteKind) => {
    const index = settings.findIndex(s => s.kind === kind)
    return index === -1 ? settings.length : index
  }

  const all: HomeSection[] = FAVOURITE_KINDS.map(kind => ({
    kind,
    title: settings.find(s => s.kind === kind)?.title || undefined,
    items: sortItems(favouritesOf(kind, content), customization?.itemPositions),
  })).filter(section => section.items.length > 0)

  return {
    layout: customization?.layout ?? 'default',
    summary: summaryOf(content),
    // sort() is stable, so kinds without a setting keep the default order at the end.
    sections: all.filter(s => !settings.find(x => x.kind === s.kind)?.hidden).sort((a, b) => rank(a.kind) - rank(b.kind)),
    gridItems: sortItems(all.flatMap(s => s.items), customization?.itemPositions),
    hasFavourites: all.length > 0, // hidden sections still count as favourites
    hasDevices: content.snapshot.live !== undefined || Object.keys(content.devices).length > 0,
  }
}
