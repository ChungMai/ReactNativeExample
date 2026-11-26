import type { RoomRepository } from '../repositories/room-repository'

export class DeleteRoomUseCase {
  constructor(private repository: RoomRepository) {}

  execute(id: string) {
    this.repository.save(this.repository.getAll().filter(r => r.id !== id))
  }
}
