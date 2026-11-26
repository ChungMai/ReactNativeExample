import type { DeviceKind } from '../../../domain/entities/device'

/** What the UI needs to render a device. */
export interface DeviceDisplay {
  id: string
  title: string
  isOn: boolean
  kind: DeviceKind
}
