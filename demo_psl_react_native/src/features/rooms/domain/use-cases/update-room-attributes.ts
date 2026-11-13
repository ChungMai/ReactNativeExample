import type { RoomAttributes } from '../entities/room'
import type { RoomRepository } from '../repositories/room-repository'

export class UpdateRoomAttributesUseCase {
  constructor(private repository: RoomRepository) {}

  execute(id: string, attributes: RoomAttributes) {
    this.repository.save(this.repository.getAll().map(r => (r.id === id ? { ...r, ...attributes } : r)))
  }
}
