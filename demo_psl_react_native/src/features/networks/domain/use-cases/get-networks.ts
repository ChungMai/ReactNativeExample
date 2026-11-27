import type { NetworkRepository } from '../repositories/network-repository'

export class GetNetworksUseCase {
  constructor(private repository: NetworkRepository) {}
  execute = () => this.repository.getList()
  active = () => this.repository.getActive()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
