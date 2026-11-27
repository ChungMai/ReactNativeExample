// What Home shows, derived from the snapshot plus the current rooms and devices. Never stored.
import type { DeviceKind } from '../../../devices'
import type { FavouriteKind, SummaryKind } from './favourites'

export interface HomeItem {
  kind: FavouriteKind
  id: string
  name: string
  /** undefined: has no power state (scene, preset, or nothing to switch). */
  isOn?: boolean
  deviceKind?: DeviceKind
}

export interface HomeSection {
  kind: FavouriteKind
  /** Custom title; the UI supplies the default one. */
  title?: string
  items: HomeItem[]
}

export interface SummaryCount {
  kind: SummaryKind
  count: number
}

export interface HomeOverview {
  layout: 'default' | 'custom'
  summary: SummaryCount[]
  sections: HomeSection[]
  /** Every favourite in one list, for the custom (grid) layout. */
  gridItems: HomeItem[]
  hasFavourites: boolean
  hasDevices: boolean
}
