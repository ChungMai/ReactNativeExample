import type { ImageSourcePropType } from 'react-native'
import type { DeviceDisplay } from '../../../devices'

/** What a room card needs. */
export interface RoomDisplay {
  id: string
  title: string
  coverSource: ImageSourcePropType
  powerBadge: 'On' | 'Off' | null // null for a room without devices
  accessibilityLabel: string
}

/** What the room detail screen needs. */
export interface RoomDetailDisplay {
  id: string
  title: string
  coverSource: ImageSourcePropType
  isOn: boolean
  canSwitch: boolean
  switchLabel: string
  isFavourite: boolean
  favouriteLabel: string
  devices: DeviceDisplay[]
}
