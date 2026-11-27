import type { HomeRepository } from '../repositories/home-repository'

export class GetHomeUseCase {
  constructor(private repository: HomeRepository) {}
  execute = () => this.repository.getState()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
