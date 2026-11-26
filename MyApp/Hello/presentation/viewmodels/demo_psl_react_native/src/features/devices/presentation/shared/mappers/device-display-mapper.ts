import type { Device } from '../../../domain/entities/device'
import type { DeviceDisplay } from '../models/device-display'

export const toDeviceDisplay = (d: Device): DeviceDisplay => ({ id: d.id, title: d.name, isOn: d.on, kind: d.kind })
