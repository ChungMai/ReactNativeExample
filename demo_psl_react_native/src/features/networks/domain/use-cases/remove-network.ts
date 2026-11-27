// Swift: validateDeleteInput / deleteNetwork and didConfirmExit.
import { NetworkError } from '../network-error'
import { availableActions, isActionEnabled, type NetworkAction } from '../network-rules'
import type { NetworkRepository } from '../repositories/network-repository'

export class RemoveNetworkUseCase {
  constructor(private repository: NetworkRepository) {}

  /** The network, if `action` is allowed on it right now. Throws a NetworkError otherwise. */
  check(id: string, action: NetworkAction) {
    const { joined, serverOnline } = this.repository.getList()
    if (!serverOnline) throw new NetworkError('offline')
    const network = joined.find(n => n.id === id)
    if (!network || !availableActions(network).includes(action) || !isActionEnabled(action, network, serverOnline)) {
      throw new NetworkError('accessUnavailable')
    }
    return network
  }

  exit = async (id: string) => {
    this.check(id, 'exit')
    await this.repository.exit(id)
  }

  /** Deleting cannot be undone, so the user types the exact network name. */
  delete = async (id: string, typedName: string) => {
    if (typedName !== this.check(id, 'delete').name) throw new NetworkError('nameMismatch')
    await this.repository.delete(id)
  }
}
