import { InMemoryStore } from '../../../shared/data/in-memory-store'
import { toAppError } from '../../../shared/domain/app-error'
import type { DeviceList, ListedDevice } from '../domain/entities/listed-device'

const EMPTY: DeviceList = { devices: [], loaded: false, serverOnline: true }

export interface DeviceSource {
  source(): string
  fetchDevices(): Promise<ListedDevice[]>
}

/**
 * The devices of the real network. Kept apart from the demo devices, which the demo rooms refer to.
 */
export class ServerDeviceList {
  private store = new InMemoryStore<DeviceList>(EMPTY)
  private source?: string
  private pending?: { source: string; done: Promise<void> }

  constructor(private api: DeviceSource, private isReal: () => boolean) {}

  /** true after a real sign-in: the screen shows this list instead of the demo devices. */
  isActive = () => this.isReal()
  get = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  /** Throws an AppError. A call while the same list is loading waits for that load. */
  refresh = (): Promise<void> => {
    const source = this.api.source()
    if (source !== this.source) {
      this.source = source
      this.store.set(EMPTY) // never show the devices of another account or network
    }
    if (this.pending?.source !== source) {
      const done = this.load(source).finally(() => {
        if (this.pending?.done === done) this.pending = undefined
      })
      this.pending = { source, done }
    }
    return this.pending.done
  }

  private async load(source: string) {
    try {
      const devices = await this.api.fetchDevices()
      if (source === this.source) this.publish({ devices, loaded: true, serverOnline: true })
    } catch (e) {
      if (source === this.source) this.publish({ ...this.get(), loaded: true, serverOnline: false })
      throw toAppError(e)
    }
  }

  private publish(next: DeviceList) {
    if (JSON.stringify(next) !== JSON.stringify(this.get())) this.store.set(next)
  }
}
