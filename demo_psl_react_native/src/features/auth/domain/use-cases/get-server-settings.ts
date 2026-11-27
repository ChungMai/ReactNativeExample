import type { ServerRepository } from '../repositories/server-repository'

export class GetServerSettingsUseCase {
  constructor(private repository: ServerRepository) {}
  execute = () => this.repository.get()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
