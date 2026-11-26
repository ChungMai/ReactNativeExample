import type { NewRoom } from '../entities/room'
import type { RoomRepository } from '../repositories/room-repository'

export class CreateRoomUseCase {
  constructor(private repository: RoomRepository) {}

  execute(input: NewRoom) {
    const now = Date.now()
    const room = { ...input, name: input.name.trim(), id: 'r' + now, favourite: false, createdAt: now }
    this.repository.save([...this.repository.getAll(), room])
  }
}
