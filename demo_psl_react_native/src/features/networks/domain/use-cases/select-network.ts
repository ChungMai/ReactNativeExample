// Swift: didSelectRegisteredNetwork → accessNetwork → loginToNetwork.
import { NetworkError } from '../network-error'
import type { NetworkRepository } from '../repositories/network-repository'

export class SelectNetworkUseCase {
  constructor(private repository: NetworkRepository) {}

  /** Makes the network active. Throws a NetworkError when it cannot be used. */
  async execute(id: string): Promise<void> {
    const network = this.repository.getList().joined.find(n => n.id === id)
    if (!network) return

    // Offline, there is nothing to ask: go in with what was last known (Swift's offline mode).
    const mode = this.repository.getList().serverOnline
      ? await this.repository.checkAccess(id).catch(() => 'troubleshoot' as const)
      : network.mode

    if (mode === 'troubleshoot') throw new NetworkError('unreachable')
    if (mode === 'remote' && !network.remoteAccessEnabled) throw new NetworkError('remoteAccessDenied')
    this.repository.setActive({ id, name: network.name, role: network.role, mode })
  }
}
