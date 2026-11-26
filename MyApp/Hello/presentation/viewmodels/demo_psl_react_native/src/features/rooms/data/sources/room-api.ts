import type { AppError } from '../../../../shared/domain/app-error'
import type { RoomDTO } from '../dto/room-dto'
import { ROOM_SEED } from '../room-seed'

export interface RoomApi {
  fetchRooms(): Promise<RoomDTO[]>
}

/** Stub for the backend. Replace the body with a real request when an API exists. */
export class FakeRoomApi implements RoomApi {
  /** Pass an AppError to make every request fail (handy for tests and for demoing the error state). */
  constructor(private failWith?: AppError) {}

  async fetchRooms(): Promise<RoomDTO[]> {
    if (this.failWith) throw this.failWith
    return ROOM_SEED
  }
}
