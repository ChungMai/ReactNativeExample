import type { DeviceRepository } from '../repositories/device-repository'

export class ToggleDeviceUseCase {
  constructor(private repository: DeviceRepository) {}

  execute(id: string) {
    const devices = this.repository.getAll()
    const d = devices[id]
    if (!d) return
    this.repository.save({ ...devices, [id]: { ...d, on: !d.on } })
  }
}
