// Swift: loadInitalData (first load and polling) and refreshHome (pull to refresh).
import { toAppError } from '../../../../shared/domain/app-error'
import type { HomeRepository } from '../repositories/home-repository'

export class RefreshHomeUseCase {
  constructor(private repository: HomeRepository) {}

  /** Throws an AppError. */
  execute = async (): Promise<void> => {
    try {
      await this.repository.refresh()
    } catch (e) {
      throw toAppError(e)
    }
  }
}
