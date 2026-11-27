import type { ImageSourcePropType } from 'react-native'
import type { DeviceKind } from '../../../../devices'

/** What the room detail screens need. Read only. */
export interface RoomDetailDisplay {
  id: string
  title: string
  coverSource: ImageSourcePropType
  isOn: boolean
  switchLabel: string
  devices: {
    id: string
    title: string
    kind: DeviceKind
    isOn: boolean
    /** false: has no power state, so there is no switch. */
    hasSwitch: boolean
    /** Shown instead of the switch, e.g. the device cannot be reached. */
    note?: string
  }[]
  presets: { id: string; name: string }[]
  /** Replaces the empty texts while the devices load or after they failed to. */
  devicesMessage?: string
}
