import type { DeviceMap } from '../domain/entities/device'
import type { DeviceRepository } from '../domain/repositories/device-repository'
import type { DeviceDTO } from './dto/device-dto'
import { deviceToDTO, devicesToMap } from './mappers/device-mapper'
import type { DeviceApi } from './sources/device-api'
import type { DeviceDb } from './sources/device-db'

export class CachedDeviceRepository implements DeviceRepository {
  // Mapping creates new objects; cache by source so getAll() stays referentially stable
  // (useSyncExternalStore requires that).
  private cache?: { src: DeviceDTO[]; out: DeviceMap }
  // The API stub has no write endpoint, so local changes never reach it. A refresh would replace them
  // with the server data and lose them (e.g. a room switched on, then the lazily mounted tab loads).
  private hasLocalChanges = false

  constructor(private api: DeviceApi, private db: DeviceDb) {}

  getAll = () => {
    const src = this.db.getAll()
    if (this.cache?.src !== src) this.cache = { src, out: devicesToMap(src) }
    return this.cache.out
  }
  save = (devices: DeviceMap) => {
    this.hasLocalChanges = true
    this.db.save(Object.values(devices).map(deviceToDTO))
  }
  subscribe = (listener: () => void) => this.db.subscribe(listener)

  async refresh() {
    if (this.hasLocalChanges) return // local changes win until they can be sent to the server
    this.db.save(await this.api.fetchDevices())
  }
}
