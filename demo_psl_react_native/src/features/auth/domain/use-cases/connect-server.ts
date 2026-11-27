// Swift: SelectServerViewPresenter.next. A server is only selected after it answered properly.
import { checkServerAddress } from '../server-address'
import { ServerError } from '../server-error'
import type { ServerRepository } from '../repositories/server-repository'

export class ConnectServerUseCase {
  constructor(private repository: ServerRepository) {}

  /** The default server needs no check: signing in reports its problems. */
  useDefault = (): void => {
    this.repository.save({ saved: this.repository.get().saved })
  }

  /** Throws a ServerError. */
  async execute(address: string): Promise<void> {
    const { url, error } = checkServerAddress(address)
    if (url === undefined) throw new ServerError(error!)
    try {
      await this.repository.verify(url)
    } catch (e) {
      throw e instanceof ServerError ? e : new ServerError('unreachable')
    }
    const { saved } = this.repository.get()
    this.repository.save({ selected: url, saved: saved.includes(url) ? saved : [...saved, url] })
  }
}
