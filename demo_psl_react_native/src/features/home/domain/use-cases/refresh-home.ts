// Swift: loadInitalData (first load and polling) and refreshHome (pull to refresh).
import { toAppError } from '../../../../shared/domain/app-error'
import type { HomeRepository } from '../repositories/home-repository'

type Loader = { execute(force?: boolean): Promise<void> }

export class RefreshHomeUseCase {
  constructor(private repository: HomeRepository, private loaders: Loader[]) {}

  /** `force` reloads rooms and devices too (pull to refresh). Throws an AppError. */
  execute = async (force = false): Promise<void> => {
    try {
      await Promise.all([this.repository.refresh(), ...this.loaders.map(l => l.execute(force))])
    } catch (e) {
      throw toAppError(e)
    }
  }
}
