import type { DeviceKind } from '../../../devices'

/** A room of the real network. */
export interface ListedRoom {
  readonly id: string
  name: string
  /** undefined: has nothing to switch. */
  isOn?: boolean
}

/** What is in a room. */
export interface RoomMembers {
  devices: { id: string; name: string; kind: DeviceKind; isOn?: boolean; unreachable: boolean }[]
  presets: { id: string; name: string }[]
}

export type MembersState = RoomMembers | 'loading' | 'error'

export interface RoomList {
  rooms: ListedRoom[]
  /** Keyed by room id; only the rooms that were opened. */
  members: Record<string, MembersState>
  /** false until the first answer (success or failure). */
  loaded: boolean
  /** false after a failed refresh; `rooms` then holds the last known data. */
  serverOnline: boolean
}
