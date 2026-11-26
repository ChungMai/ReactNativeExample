import type { Room } from '../domain/entities/room'
import type { RoomRepository } from '../domain/repositories/room-repository'
import type { RoomDTO } from './dto/room-dto'
import { roomToDTO, roomToDomain } from './mappers/room-mapper'
import type { RoomApi } from './sources/room-api'
import type { RoomDb } from './sources/room-db'

export class CachedRoomRepository implements RoomRepository {
  // Cache by source so getAll() stays referentially stable (useSyncExternalStore needs that).
  private cache?: { src: RoomDTO[]; out: Room[] }
  // The API stub has no write endpoint, so local changes never reach it. A refresh would replace them
  // with the server data and lose them (e.g. a room switched on, then the lazily mounted tab loads).
  private hasLocalChanges = false

  constructor(private api: RoomApi, private db: RoomDb) {}

  getAll = () => {
    const src = this.db.getAll()
    if (this.cache?.src !== src) this.cache = { src, out: src.map(roomToDomain) }
    return this.cache.out
  }
  save = (rooms: Room[]) => {
    this.hasLocalChanges = true
    this.db.save(rooms.map(roomToDTO))
  }
  subscribe = (listener: () => void) => this.db.subscribe(listener)

  async refresh() {
    if (this.hasLocalChanges) return // local changes win until they can be sent to the server
    this.db.save(await this.api.fetchRooms())
  }
}
