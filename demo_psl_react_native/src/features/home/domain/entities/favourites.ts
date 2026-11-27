// Swift: PSLFavoriteSectionType, HomeInfo, PSLHomeCustomizationData.

/** Order here is the default order of the sections on Home. */
export const FAVOURITE_KINDS = ['scene', 'device', 'room', 'group', 'zone', 'preset'] as const
export type FavouriteKind = (typeof FAVOURITE_KINDS)[number]

/** Kinds counted in the "switched on" summary. */
export type SummaryKind = Extract<FavouriteKind, 'device' | 'room' | 'group' | 'zone'>

/** A group or a zone: devices switched together. */
export interface DeviceCollection {
  readonly id: string
  name: string
  deviceIds: string[]
}

/** A scene or a preset: the power each device gets when it is triggered. */
export interface Scene {
  readonly id: string
  name: string
  states: Record<string, boolean>
}

export interface HomeNetwork {
  name: string
  mode: 'local' | 'remote'
  isPrimaryUser: boolean
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

/** Favourite ids per kind. Favourite rooms are not here: the rooms feature owns `Room.favourite`. */
export type FavouriteIds = Record<Exclude<FavouriteKind, 'room'>, string[]>

export interface HomeSnapshot {
  network: HomeNetwork
  favourites: FavouriteIds
  groups: DeviceCollection[]
  zones: DeviceCollection[]
  scenes: Scene[]
  presets: Scene[]
  customization?: HomeCustomization
}
