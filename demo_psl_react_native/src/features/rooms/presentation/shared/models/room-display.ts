import type { ImageSourcePropType } from 'react-native'
import type { DeviceDisplay } from '../../../../devices'

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
  devices: (DeviceDisplay & {
    /** Shown instead of the switch, e.g. the device cannot be reached. */
    note?: string
    /** false: has no power state, so there is no switch. */
    hasSwitch?: boolean
  })[]
  /** true for a room of the real server: nothing can be switched or edited. */
  readOnly?: boolean
  presets?: { id: string; name: string }[]
  /** Replaces the empty texts while the devices load or after they failed to. */
  devicesMessage?: string
}
