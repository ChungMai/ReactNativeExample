import type { Device } from '@/features/devices'
import type { Room } from '@/features/rooms/domain/entities/room'
import { toRoomDetailDisplay, toRoomDisplay } from '@/features/rooms/presentation/mappers/room-display-mapper'

jest.mock('@/features/rooms/presentation/assets/covers', () => ({ COVERS: ['cover-0', 'cover-1', 'cover-2'] }))

const room: Room = { id: 'r1', name: 'Bedroom', cover: 1, deviceIds: ['d1'], favourite: false, createdAt: 1 }
const lamp: Device = { id: 'd1', name: 'Lamp', kind: 'light', on: true }

describe('toRoomDisplay', () => {
  it.each([
    ['on', 'On', 'Bedroom, on'],
    ['off', 'Off', 'Bedroom, off'],
    ['empty', null, 'Bedroom'],
  ] as const)("power '%s' -> badge %s", (power, badge, label) => {
    expect(toRoomDisplay({ room, power })).toEqual({
      id: 'r1', title: 'Bedroom', coverSource: 'cover-1', powerBadge: badge, accessibilityLabel: label,
    })
  })
})

describe('toRoomDetailDisplay', () => {
  it('builds labels and flags for a room that is on', () => {
    expect(toRoomDetailDisplay({ room, devices: [lamp], power: 'on' })).toEqual({
      id: 'r1', title: 'Bedroom', coverSource: 'cover-1',
      isOn: true, canSwitch: true, switchLabel: 'Switch On',
      isFavourite: false, favouriteLabel: 'Add to Favourites',
      devices: [{ id: 'd1', title: 'Lamp', isOn: true }],
    })
  })

  it('disables the switch for a room without devices', () => {
    const d = toRoomDetailDisplay({ room: { ...room, deviceIds: [], favourite: true }, devices: [], power: 'empty' })
    expect(d).toMatchObject({
      isOn: false, canSwitch: false, switchLabel: 'Switch Off',
      isFavourite: true, favouriteLabel: 'Remove from Favourites', devices: [],
    })
  })
})
