import type { Room } from '@/features/rooms/domain/entities/room'
import { CachedRoomRepository } from '@/features/rooms/data/cached-room-repository'
import type { RoomDTO } from '@/features/rooms/data/dto/room-dto'
import { FakeRoomApi } from '@/features/rooms/data/sources/room-api'
import { InMemoryRoomDb } from '@/features/rooms/data/sources/room-db'

const make = () => new CachedRoomRepository(new FakeRoomApi(), new InMemoryRoomDb())

describe('CachedRoomRepository', () => {
  it('maps the seeded DTOs to domain rooms', () => {
    const rooms = make().getAll()
    expect(rooms.map(r => r.name)).toEqual(['Room 11', 'Virtual Room', 'Bedroom'])
    expect(rooms[1].deviceIds).toEqual(['d1', 'd2', 'd3'])
  })

  it('returns the same reference until data changes (required by useSyncExternalStore)', () => {
    const repo = make()
    expect(repo.getAll()).toBe(repo.getAll())
    const next: Room[] = [...repo.getAll()]
    repo.save(next)
    expect(repo.getAll()).not.toBe(next) // re-mapped from the new DTOs
    expect(repo.getAll()).toBe(repo.getAll())
  })

  it('notifies subscribers on save and stops after unsubscribe', () => {
    const repo = make()
    const listener = jest.fn()
    const unsubscribe = repo.subscribe(listener)
    repo.save(repo.getAll())
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    repo.save(repo.getAll())
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('refresh() replaces the cache with what the API returns', async () => {
    const dtos: RoomDTO[] = [
      { id: 'x', name: 'From API', cover_index: 0, device_ids: [], is_favourite: false, created_at: new Date(5).toISOString() },
    ]
    const api = { fetchRooms: jest.fn().mockResolvedValue(dtos) }
    const repo = new CachedRoomRepository(api, new InMemoryRoomDb())
    await repo.refresh()
    expect(repo.getAll().map(r => r.name)).toEqual(['From API'])
  })

  it('refresh() keeps local changes instead of replacing them with the API data', async () => {
    const api = new FakeRoomApi()
    const fetch = jest.spyOn(api, 'fetchRooms')
    const repo = new CachedRoomRepository(api, new InMemoryRoomDb())
    repo.save(repo.getAll().slice(1)) // a local change: one room removed
    await repo.refresh()
    expect(repo.getAll()).toHaveLength(2)
    expect(fetch).not.toHaveBeenCalled()
  })
})
