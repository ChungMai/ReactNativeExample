// Swift: deleteCachedServer. Removing the server in use goes back to the default one.
import type { ServerRepository } from '../repositories/server-repository'

export class RemoveServerUseCase {
  constructor(private repository: ServerRepository) {}

  execute(url: string): void {
    const { selected, saved } = this.repository.get()
    this.repository.save({
      selected: selected === url ? undefined : selected,
      saved: saved.filter(s => s !== url),
    })
  }
}
