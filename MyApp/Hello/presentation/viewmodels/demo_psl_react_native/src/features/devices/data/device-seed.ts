import type { DeviceDTO } from './dto/device-dto'

export const DEVICE_SEED: DeviceDTO[] = [
  { id: 'd1', name: 'Ceiling light', type: 'light', is_on: false },
  { id: 'd2', name: 'Floor lamp', type: 'light', is_on: false },
  { id: 'd3', name: 'Smart plug', type: 'plug', is_on: false },
  { id: 'd4', name: 'Desk fan', type: 'fan', is_on: false },
  { id: 'd5', name: 'Window blind', type: 'blind', is_on: false },
  { id: 'd6', name: 'Bedside light', type: 'light', is_on: true },
]
