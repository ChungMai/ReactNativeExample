// Domain types for the demo. Literal unions, interfaces, a discriminated
// union for actions and a few utility types.
import type { ImageSourcePropType } from 'react-native'

export type DeviceKind = 'light' | 'plug' | 'fan' | 'blind'

export interface Device {
  readonly id: string
  name: string
  kind: DeviceKind
  on: boolean
}

export interface Room {
  readonly id: string
  name: string
  cover: number                // index into COVERS
  deviceIds: string[]
  favourite: boolean
  createdAt: number
}

export type SortKey = 'alphabetical' | 'recent'
export type SortDir = 'asc' | 'desc'

export const SORT_LABELS: Record<SortKey, string> = {
  alphabetical: 'Alphabetical',
  recent: 'Recently added',
}

/** What the "New Room" form produces. */
export type NewRoom = Pick<Room, 'name' | 'cover' | 'deviceIds'>

export type Action =
  | { type: 'addRoom'; room: NewRoom }
  | { type: 'removeRoom'; id: string }
  | { type: 'toggleFavourite'; id: string }
  | { type: 'setRoomPower'; id: string; on: boolean }
  | { type: 'toggleDevice'; id: string }

export interface State {
  rooms: Room[]
  devices: Record<string, Device>
}

/** Room power is derived from its devices – never stored separately. */
export type RoomPower = 'on' | 'off' | 'empty'

export function assertNever(x: never): never {
  throw new Error('Unhandled case: ' + JSON.stringify(x))
}

export type Cover = ImageSourcePropType
