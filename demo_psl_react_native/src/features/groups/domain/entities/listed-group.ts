/** Order of the sections on the Groups screen. Swift: `categories` without Blind, then PanL Display. */
export const GROUP_CATEGORIES = [
  'Aircon', 'Curtain', 'Fan', 'Lighting', 'Meter', 'Sensor', 'Speaker', 'Switch/Plug/Socket/Relay/Button', 'TV', 'Others',
  'PanL Display',
] as const
export type GroupCategory = (typeof GROUP_CATEGORIES)[number]

export interface ListedGroup {
  readonly id: string
  name: string
  category: GroupCategory
  /** undefined: has no power state. */
  isOn?: boolean
}

export interface GroupList {
  groups: ListedGroup[]
  /** false until the first answer (success or failure). */
  loaded: boolean
  /** false after a failed refresh; `groups` then holds the last known data. */
  serverOnline: boolean
}
