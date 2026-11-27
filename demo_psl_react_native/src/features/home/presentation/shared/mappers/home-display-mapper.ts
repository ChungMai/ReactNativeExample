// Swift: HomeSections.title(), HomeActiveItemsCollectionViewCell, AccessoryGridCollectionViewCell.
import type { DeviceKind } from '../../../../devices'
import type { IconName } from '../../../../../shared/navigation/shared/nav-items'
import type { FavouriteKind } from '../../../domain/entities/favourites'
import type { HomeItem, HomeSection, SummaryCount } from '../../../domain/entities/home-overview'
import type { CardDisplay, SectionDisplay, SummaryDisplay } from '../models/home-display'

export const SECTION_TITLES: Record<FavouriteKind, string> = {
  scene: 'Favourite Scenes',
  device: 'Favourite Devices',
  room: 'Favourite Rooms',
  group: 'Favourite Groups',
  zone: 'Favourite Zones',
  preset: 'Favourite Presets',
}

const KIND_ICONS: Record<FavouriteKind, IconName> = {
  scene: 'color-wand', device: 'hardware-chip', room: 'cube', group: 'aperture', zone: 'map', preset: 'options',
}
const DEVICE_ICONS: Record<DeviceKind, IconName> = {
  light: 'bulb', plug: 'power', fan: 'snow', blind: 'reorder-four',
}
const SUMMARY_NOUNS = { device: 'Device', room: 'Room', group: 'Group', zone: 'Zone' } as const

export function toCardDisplay({ kind, id, name, isOn, deviceKind }: HomeItem): CardDisplay {
  return {
    key: `${kind}:${id}`,
    kind,
    id,
    title: name,
    icon: deviceKind ? DEVICE_ICONS[deviceKind] : KIND_ICONS[kind],
    isOn,
  }
}

export function toSectionDisplay(section: HomeSection): SectionDisplay {
  return {
    kind: section.kind,
    title: section.title ?? SECTION_TITLES[section.kind],
    cards: section.items.map(toCardDisplay),
  }
}

export function toSummaryDisplay({ kind, count }: SummaryCount): SummaryDisplay {
  return {
    kind,
    icon: kind === 'device' ? 'bulb' : KIND_ICONS[kind],
    title: `${count} ${SUMMARY_NOUNS[kind]}${count === 1 ? '' : 's'}`,
    subtitle: count === 1 ? 'is switched on' : 'are switched on',
  }
}
