import { toAppError } from '../../../../shared/domain/app-error'
import type { DeviceRepository } from '../repositories/device-repository'

export class LoadDevicesUseCase {
  private loaded = false

  constructor(private repository: DeviceRepository) {}

  /** Loads once per app session. Pass `force` to retry or to refresh again. Throws an AppError. */
  execute = async (force = false): Promise<void> => {
    if (this.loaded && !force) return
    try {
      await this.repository.refresh()
      this.loaded = true
    } catch (e) {
      throw toAppError(e)
    }
  }
}
