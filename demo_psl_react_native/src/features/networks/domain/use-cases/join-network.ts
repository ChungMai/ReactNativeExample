// Swift: didSelectUnRegisteredNetwork → requestAccess → sendRequest.
import { NetworkError } from '../network-error'
import type { NetworkRepository } from '../repositories/network-repository'

export class JoinNetworkUseCase {
  constructor(private repository: NetworkRepository) {}

  /** Throws a NetworkError if no request can be sent. Call before asking the user to confirm. */
  check(id: string): void {
    const { nearby, serverOnline } = this.repository.getList()
    if (!serverOnline) throw new NetworkError('offline')
    const network = nearby.find(n => n.id === id)
    if (network && !network.onCurrentServer) throw new NetworkError('otherServer')
    if (network?.requestPending) throw new NetworkError('requestPending')
  }

  async execute(id: string): Promise<void> {
    this.check(id)
    await this.repository.requestToJoin(id)
  }
}
