import { toDeviceDisplay } from '../../../../devices'
import type { RoomWithPower, RoomWithDevices } from '../../../domain/room-with-power'
import { COVERS } from '../assets/covers'
import type { RoomDetailDisplay, RoomDisplay } from '../models/room-display'

export function toRoomDisplay({ room, power }: RoomWithPower): RoomDisplay {
  const powerBadge = power === 'empty' ? null : power === 'on' ? 'On' : 'Off'
  return {
    id: room.id,
    title: room.name,
    coverSource: COVERS[room.cover],
    powerBadge,
    accessibilityLabel: powerBadge ? `${room.name}, ${power}` : room.name,
  }
}

export function toRoomDetailDisplay({ room, devices, power }: RoomWithDevices): RoomDetailDisplay {
  return {
    id: room.id,
    title: room.name,
    coverSource: COVERS[room.cover],
    isOn: power === 'on',
    canSwitch: power !== 'empty',
    switchLabel: power === 'on' ? 'Switch On' : 'Switch Off',
    isFavourite: room.favourite,
    favouriteLabel: room.favourite ? 'Remove from Favourites' : 'Add to Favourites',
    devices: devices.map(toDeviceDisplay),
  }
}
