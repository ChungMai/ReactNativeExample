import type { DeviceMap } from '../entities/device'

export interface DeviceRepository {
  getAll(): DeviceMap
  save(devices: DeviceMap): void
  subscribe(listener: () => void): () => void
  /** Pull from the API and refresh the local cache. */
  refresh(): Promise<void>
}
