// Read models: a Room combined with data derived from its Devices.
// They are NOT stored. They are recomputed whenever a Room or Device changes.
//
//   Room            -> what the room IS      (id, name, deviceIds, ...)
//   RoomWithPower   -> Room + is it on/off?  (list / cards)
//   RoomWithDevices -> Room + its Device objects + power  (detail screen)
import type { Device, DeviceMap } from '../../devices'
import type { Room } from './entities/room'

/** Room power is derived from its devices – never stored separately. */
export type RoomPower = 'on' | 'off' | 'empty'
export type RoomWithPower = { room: Room; power: RoomPower }
export type RoomWithDevices = { room: Room; devices: Device[]; power: RoomPower }

export function powerOf(devices: Device[]): RoomPower {
  if (devices.length === 0) return 'empty'
  return devices.some(d => d.on) ? 'on' : 'off'
}

const devicesOf = (all: DeviceMap, room: Room): Device[] => room.deviceIds.map(id => all[id])

export function toRoomsWithPower(rooms: Room[], devices: DeviceMap): RoomWithPower[] {
  return rooms.map(room => ({ room, power: powerOf(devicesOf(devices, room)) }))
}

export function toRoomWithDevices(room: Room | undefined, devices: DeviceMap): RoomWithDevices | undefined {
  if (!room) return undefined
  const list = devicesOf(devices, room)
  return { room, devices: list, power: powerOf(list) }
}
