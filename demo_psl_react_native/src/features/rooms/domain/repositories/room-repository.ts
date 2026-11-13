import type { Room } from '../entities/room'

export interface RoomRepository {
  getAll(): Room[]
  save(rooms: Room[]): void
  subscribe(listener: () => void): () => void
  /** Pull from the API and refresh the local cache. */
  refresh(): Promise<void>
}
