import type { SetDevicesPowerUseCase } from '../../../devices'
import type { RoomRepository } from '../repositories/room-repository'

export class TriggerRoomUseCase {
  constructor(private repository: RoomRepository, private setDevicesPower: SetDevicesPowerUseCase) {}

  execute(id: string, on: boolean) {
    const room = this.repository.getAll().find(r => r.id === id)
    if (room) this.setDevicesPower.execute(room.deviceIds, on)
  }
}
