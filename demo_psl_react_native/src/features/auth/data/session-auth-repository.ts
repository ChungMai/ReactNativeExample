import { AuthError } from '../domain/auth-error'
import type { Session } from '../domain/entities/session'
import type { AuthRepository } from '../domain/repositories/auth-repository'
import type { AuthApi } from './sources/auth-api'
import type { SessionStore } from './sources/session-store'

export class SessionAuthRepository implements AuthRepository {
  constructor(private api: AuthApi, private store: SessionStore) {}

  getSession = () => this.store.get().session
  getLastEmail = () => this.store.get().lastEmail
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  async verify(email: string, password: string) {
    if (!(await this.api.signIn(email, password))) throw new AuthError('invalidCredentials')
  }
  saveSession(session: Session) {
    this.store.set({ session, lastEmail: session.email })
  }
  clearSession() {
    this.store.set({ lastEmail: this.getLastEmail() })
  }
}
