import type { Device } from '@/features/devices/domain/entities/device'
import type { DeviceDTO } from '@/features/devices/data/dto/device-dto'
import { deviceToDTO, deviceToDomain, devicesToMap } from '@/features/devices/data/mappers/device-mapper'

describe('device mapper', () => {
  it('maps a DTO to the domain entity', () => {
    const dto: DeviceDTO = { id: 'd1', name: 'Lamp', type: 'light', is_on: true }
    expect(deviceToDomain(dto)).toEqual({ id: 'd1', name: 'Lamp', kind: 'light', on: true })
  })

  it("falls back to 'plug' for an unknown device type", () => {
    expect(deviceToDomain({ id: 'd', name: 'X', type: 'toaster', is_on: false }).kind).toBe('plug')
  })

  it('maps an entity back to a DTO', () => {
    const d: Device = { id: 'd2', name: 'Fan', kind: 'fan', on: false }
    expect(deviceToDTO(d)).toEqual({ id: 'd2', name: 'Fan', type: 'fan', is_on: false })
  })

  it('builds a map keyed by id', () => {
    const map = devicesToMap([
      { id: 'a', name: 'A', type: 'light', is_on: false },
      { id: 'b', name: 'B', type: 'blind', is_on: true },
    ])
    expect(Object.keys(map)).toEqual(['a', 'b'])
    expect(map.b.kind).toBe('blind')
  })
})
