import { CachedDeviceRepository } from '@/features/devices/data/cached-device-repository'
import { FakeDeviceApi } from '@/features/devices/data/sources/device-api'
import { InMemoryDeviceDb } from '@/features/devices/data/sources/device-db'

const make = () => new CachedDeviceRepository(new FakeDeviceApi(), new InMemoryDeviceDb())

describe('CachedDeviceRepository', () => {
  it('exposes the seeded devices as a map', () => {
    const devices = make().getAll()
    expect(Object.keys(devices)).toEqual(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'])
    expect(devices.d6.on).toBe(true)
  })

  it('returns the same reference until data changes', () => {
    const repo = make()
    expect(repo.getAll()).toBe(repo.getAll())
    const before = repo.getAll()
    repo.save({ ...before })
    expect(repo.getAll()).not.toBe(before)
  })

  it('persists a change and notifies subscribers', () => {
    const repo = make()
    const listener = jest.fn()
    repo.subscribe(listener)
    repo.save({ ...repo.getAll(), d1: { ...repo.getAll().d1, on: true } })
    expect(repo.getAll().d1.on).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('refresh() replaces the cache with what the API returns', async () => {
    const api = { fetchDevices: jest.fn().mockResolvedValue([{ id: 'z', name: 'Z', type: 'fan', is_on: true }]) }
    const repo = new CachedDeviceRepository(api, new InMemoryDeviceDb())
    await repo.refresh()
    expect(Object.keys(repo.getAll())).toEqual(['z'])
  })

  it('refresh() keeps local changes instead of replacing them with the API data', async () => {
    const api = new FakeDeviceApi()
    const fetch = jest.spyOn(api, 'fetchDevices')
    const repo = new CachedDeviceRepository(api, new InMemoryDeviceDb())
    repo.save({ ...repo.getAll(), d1: { ...repo.getAll().d1, on: true } })
    await repo.refresh()
    expect(repo.getAll().d1.on).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })
})
