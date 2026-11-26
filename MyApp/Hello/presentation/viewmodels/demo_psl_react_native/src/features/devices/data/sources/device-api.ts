import type { AppError } from '../../../../shared/domain/app-error'
import type { DeviceDTO } from '../dto/device-dto'
import { DEVICE_SEED } from '../device-seed'

export interface DeviceApi {
  fetchDevices(): Promise<DeviceDTO[]>
}

/** Stub for the backend. Replace the body with a real request when an API exists. */
export class FakeDeviceApi implements DeviceApi {
  /** Pass an AppError to make every request fail (handy for tests and for demoing the error state). */
  constructor(private failWith?: AppError) {}

  async fetchDevices(): Promise<DeviceDTO[]> {
    if (this.failWith) throw this.failWith
    return DEVICE_SEED
  }
}
