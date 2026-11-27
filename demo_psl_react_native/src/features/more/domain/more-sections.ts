// Swift: MoreViewNavigation and MoreViewPresenter.getMorePageItems.
import type { IconName } from '../../../shared/navigation/shared/nav-items'

export interface MoreSection {
  id: string
  title: string
  icon: IconName
  /** Also shown to a secondary user; the others are for a primary user only. */
  forSecondary?: boolean
  /** How the page draws it: a grid of cards, rows of text, or the energy chart. */
  layout: 'cards' | 'rows' | 'chart'
}

export const MORE_SECTIONS: MoreSection[] = [
  { id: 'zones', title: 'Zones', icon: 'map', forSecondary: true, layout: 'cards' },
  { id: 'presets', title: 'Presets', icon: 'options', forSecondary: true, layout: 'cards' },
  { id: 'scenes', title: 'Scenes', icon: 'color-wand', forSecondary: true, layout: 'cards' },
  { id: 'events', title: 'Events', icon: 'calendar', layout: 'cards' },
  { id: 'hubs', title: 'PanL Hubs', icon: 'server', layout: 'cards' },
  { id: 'displays', title: 'PanL Displays', icon: 'tablet-landscape', layout: 'cards' },
  { id: 'accessories', title: 'PanL Accessories', icon: 'hardware-chip', layout: 'cards' },
  { id: 'meter-insights', title: 'Meter Insights', icon: 'stats-chart', layout: 'chart' },
  { id: 'users', title: 'User Management', icon: 'people', layout: 'rows' },
  { id: 'network-settings', title: 'PanL Network Settings', icon: 'settings', layout: 'rows' },
]

export const sectionsFor = (role: 'primary' | 'secondary') =>
  MORE_SECTIONS.filter(s => role === 'primary' || s.forSecondary)

export const findSection = (id: string | undefined) => MORE_SECTIONS.find(s => s.id === id)

/** An entry of one of the list pages. */
export interface MoreObject {
  readonly id: string
  name: string
  /** undefined: has no on/off state. */
  isOn?: boolean
  /** Shown on a card instead of On/Off, e.g. it cannot be reached. */
  note?: string
  /** The second line of a row. */
  detail?: string
}
