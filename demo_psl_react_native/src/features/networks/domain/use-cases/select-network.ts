// Swift: didSelectRegisteredNetwork → accessNetwork → loginToNetwork.
import { NetworkError } from '../network-error'
import type { NetworkRepository } from '../repositories/network-repository'

export class SelectNetworkUseCase {
  constructor(private repository: NetworkRepository) {}

  /** Makes the network active. Throws a NetworkError when it cannot be used. */
  execute(id: string): void {
    const network = this.repository.getList().joined.find(n => n.id === id)
    if (!network) return
    if (!network.remoteAccessEnabled) throw new NetworkError('remoteAccessDenied')
    this.repository.setActive({ id, name: network.name, role: network.role })
  }
}
