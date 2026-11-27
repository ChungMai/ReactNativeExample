// Swift: the auto login done by the splash screen. Run once when the app starts.
import type { AuthRepository } from '../repositories/auth-repository'
import { isExpired } from '../session-expiry'

export class RestoreSessionUseCase {
  constructor(private repository: AuthRepository, private now: () => number = Date.now) {}

  execute = () => {
    const session = this.repository.getSession()
    if (session && isExpired(session, this.now())) this.repository.clearSession()
  }
}
