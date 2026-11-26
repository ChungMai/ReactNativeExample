import type { Room } from '../entities/room'
import type { RoomRepository } from '../repositories/room-repository'

export class GetRoomDetailInfoUseCase {
  constructor(private repository: RoomRepository) {}
  execute = (id: string | undefined): Room | undefined => this.repository.getAll().find(r => r.id === id)
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
