import type { AuthRepository } from '../repositories/auth-repository'

export class GetSessionUseCase {
  constructor(private repository: AuthRepository) {}
  execute = () => this.repository.getSession()
  lastEmail = () => this.repository.getLastEmail()
  subscribe = (listener: () => void) => this.repository.subscribe(listener)
}
