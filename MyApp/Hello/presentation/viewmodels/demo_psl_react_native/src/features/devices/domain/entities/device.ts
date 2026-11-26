export type DeviceKind = 'light' | 'plug' | 'fan' | 'blind'

export interface Device {
  readonly id: string
  name: string
  kind: DeviceKind
  on: boolean
}

export type DeviceMap = Record<string, Device>
