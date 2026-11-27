import type { AuthRepository } from '../repositories/auth-repository'

export class LogoutUseCase {
  constructor(private repository: AuthRepository) {}
  execute = () => this.repository.clearSession()
}
