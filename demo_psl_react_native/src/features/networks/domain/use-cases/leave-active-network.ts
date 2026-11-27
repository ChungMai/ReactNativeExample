import type { NetworkRepository } from '../repositories/network-repository'

/** Back to the network list. */
export class LeaveActiveNetworkUseCase {
  constructor(private repository: NetworkRepository) {}
  execute = () => this.repository.setActive(undefined)
}
