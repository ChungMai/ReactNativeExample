import { toAppError } from '../../../../shared/domain/app-error'
import type { NetworkRepository } from '../repositories/network-repository'

export class RefreshNetworksUseCase {
  constructor(private repository: NetworkRepository) {}

  /** Throws an AppError. The last list stays available. */
  execute = async (): Promise<void> => {
    try {
      await this.repository.refresh()
    } catch (e) {
      throw toAppError(e)
    }
  }
}
