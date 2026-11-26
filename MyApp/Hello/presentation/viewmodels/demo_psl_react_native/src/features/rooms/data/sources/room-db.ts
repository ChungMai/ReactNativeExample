import { InMemoryStore } from '../../../../shared/data/in-memory-store'
import type { RoomDTO } from '../dto/room-dto'
import { ROOM_SEED } from '../room-seed'

export interface RoomDb {
  getAll(): RoomDTO[]
  save(rooms: RoomDTO[]): void
  subscribe(listener: () => void): () => void
}

/** Local cache. Starts with the seed so the UI has data before the first fetch. */
export class InMemoryRoomDb implements RoomDb {
  private store = new InMemoryStore<RoomDTO[]>(ROOM_SEED)
  getAll = () => this.store.get()
  save = (rooms: RoomDTO[]) => this.store.set(rooms)
  subscribe = (listener: () => void) => this.store.subscribe(listener)
}
