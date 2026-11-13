import type { Device, DeviceMap } from '@/features/devices'
import type { Room } from '@/features/rooms/domain/entities/room'
import { powerOf, toRoomWithDevices, toRoomsWithPower } from '@/features/rooms/domain/room-with-power'

const device = (id: string, on: boolean): Device => ({ id, name: id, kind: 'light', on })
const room = (id: string, deviceIds: string[]): Room =>
  ({ id, name: id, cover: 0, deviceIds, favourite: false, createdAt: 1 })
const map = (...ds: Device[]): DeviceMap => Object.fromEntries(ds.map(d => [d.id, d]))

describe('powerOf', () => {
  it("is 'empty' without devices", () => expect(powerOf([])).toBe('empty'))
  it("is 'off' when every device is off", () => expect(powerOf([device('a', false), device('b', false)])).toBe('off'))
  it("is 'on' when at least one device is on", () => expect(powerOf([device('a', false), device('b', true)])).toBe('on'))
})

describe('toRoomsWithPower', () => {
  it('derives the power of each room from its devices', () => {
    const devices = map(device('d1', true), device('d2', false))
    const result = toRoomsWithPower([room('r1', ['d1']), room('r2', ['d2']), room('r3', [])], devices)
    expect(result.map(r => r.power)).toEqual(['on', 'off', 'empty'])
  })
})

describe('toRoomWithDevices', () => {
  it('returns undefined when the room does not exist', () => {
    expect(toRoomWithDevices(undefined, {})).toBeUndefined()
  })

  it('returns the room with its devices and power', () => {
    const d1 = device('d1', true)
    const r = room('r1', ['d1'])
    expect(toRoomWithDevices(r, map(d1))).toEqual({ room: r, devices: [d1], power: 'on' })
  })
})
