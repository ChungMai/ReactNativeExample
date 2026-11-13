import { InMemoryStore } from '../../../../shared/data/in-memory-store'
import type { DeviceDTO } from '../dto/device-dto'
import { DEVICE_SEED } from '../device-seed'

export interface DeviceDb {
  getAll(): DeviceDTO[]
  save(devices: DeviceDTO[]): void
  subscribe(listener: () => void): () => void
}

/** Local cache. Starts with the seed so the UI has data before the first fetch. */
export class InMemoryDeviceDb implements DeviceDb {
  private store = new InMemoryStore<DeviceDTO[]>(DEVICE_SEED)
  getAll = () => this.store.get()
  save = (devices: DeviceDTO[]) => this.store.set(devices)
  subscribe = (listener: () => void) => this.store.subscribe(listener)
}
