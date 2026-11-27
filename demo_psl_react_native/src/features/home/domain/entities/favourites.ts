// Swift: PSLFavoriteSectionType, HomeInfo, PSLHomeCustomizationData.
import type { DeviceMap } from '../../../devices'

/** Order here is the default order of the sections on Home. */
export const FAVOURITE_KINDS = ['scene', 'device', 'room', 'group', 'zone', 'preset'] as const
export type FavouriteKind = (typeof FAVOURITE_KINDS)[number]

/** Kinds counted in the "switched on" summary. */
export type SummaryKind = Extract<FavouriteKind, 'device' | 'room' | 'group' | 'zone'>

export interface NamedItem {
  readonly id: string
  name: string
}

/** A room, group or zone. */
export interface SwitchableItem extends NamedItem {
  /** undefined: has nothing to switch. */
  isOn?: boolean
}

export interface SectionSetting {
  kind: FavouriteKind
  title?: string
  hidden: boolean
}

export interface HomeCustomization {
  layout: 'default' | 'custom'
  sections: SectionSetting[]
  summary: { hidden: boolean; items: { kind: SummaryKind; hidden: boolean }[] }
  itemPositions: { id: string; position: number }[]
}

/** Favourite ids per kind. Rooms are listed in `HomeSnapshot.rooms`. */
export type FavouriteIds = Record<Exclude<FavouriteKind, 'room'>, string[]>

export interface HomeSnapshot {
  favourites: FavouriteIds
  devices: DeviceMap
  rooms: SwitchableItem[]
  groups: SwitchableItem[]
  zones: SwitchableItem[]
  scenes: NamedItem[]
  presets: NamedItem[]
  /** How many are switched on in the whole network, not only among the favourites. */
  onCounts: Record<SummaryKind, number>
  customization?: HomeCustomization
}
