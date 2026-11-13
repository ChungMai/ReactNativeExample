import type { DeviceRepository } from '../repositories/device-repository'

export class SetDevicesPowerUseCase {
  constructor(private repository: DeviceRepository) {}

  execute(ids: string[], on: boolean) {
    const next = { ...this.repository.getAll() }
    for (const id of ids) if (next[id]) next[id] = { ...next[id], on }
    this.repository.save(next)
  }
}
