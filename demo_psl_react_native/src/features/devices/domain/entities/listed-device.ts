/** Order of the sections on the Devices screen. Swift: `categories`. */
export const DEVICE_CATEGORIES = [
  'Aircon', 'Blind', 'Curtain', 'Fan', 'Lighting', 'Meter', 'Sensor', 'Speaker', 'Switch/Plug/Socket/Relay/Button', 'TV', 'Others',
] as const
export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number]

/** A device of the real network. */
export interface ListedDevice {
  readonly id: string
  name: string
  category: DeviceCategory
  /** undefined: has no power state (e.g. a sensor). */
  isOn?: boolean
  unreachable: boolean
}

export interface DeviceList {
  devices: ListedDevice[]
  /** false until the first answer (success or failure). */
  loaded: boolean
  /** false after a failed refresh; `devices` then holds the last known data. */
  serverOnline: boolean
}
