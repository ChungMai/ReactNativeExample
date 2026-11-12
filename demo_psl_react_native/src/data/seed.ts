// Initial devices and rooms.
import type { Device, State } from '../types'

const devices: Device[] = [
  { id: 'd1', name: 'Ceiling light', kind: 'light', on: false },
  { id: 'd2', name: 'Floor lamp', kind: 'light', on: false },
  { id: 'd3', name: 'Smart plug', kind: 'plug', on: false },
  { id: 'd4', name: 'Desk fan', kind: 'fan', on: false },
  { id: 'd5', name: 'Window blind', kind: 'blind', on: false },
  { id: 'd6', name: 'Bedside light', kind: 'light', on: true },
]

export const SEED: State = {
  devices: Object.fromEntries(devices.map(d => [d.id, d])),
  rooms: [
    { id: 'r1', name: 'Room 11', cover: 0, deviceIds: [], favourite: true, createdAt: 1 },
    { id: 'r2', name: 'Virtual Room', cover: 5, deviceIds: ['d1', 'd2', 'd3'], favourite: false, createdAt: 2 },
    { id: 'r3', name: 'Bedroom', cover: 3, deviceIds: ['d6'], favourite: false, createdAt: 3 },
  ],
}
