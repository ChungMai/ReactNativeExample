import type { RoomRepository } from '../repositories/room-repository'

export class GetAllRoomsUseCase {
  constructor(private repository: RoomRepository) {}
  execute = () => this.repository.getAll()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
