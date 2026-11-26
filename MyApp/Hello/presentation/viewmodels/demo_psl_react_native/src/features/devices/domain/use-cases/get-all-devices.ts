import type { DeviceRepository } from '../repositories/device-repository'

export class GetAllDevicesUseCase {
  constructor(private repository: DeviceRepository) {}
  execute = () => this.repository.getAll()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
