import { AuthError } from '../domain/auth-error'
import type { Session } from '../domain/entities/session'
import type { AuthRepository } from '../domain/repositories/auth-repository'
import type { AuthApi } from './sources/auth-api'
import type { SessionStore } from './sources/session-store'

export class SessionAuthRepository implements AuthRepository {
  /** `forget` drops whatever else belongs to the signed-in user, e.g. tokens. */
  constructor(private api: AuthApi, private store: SessionStore, private forget: () => void = () => {}) {}

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
    this.forget()
    this.store.set({ lastEmail: this.getLastEmail() })
  }
}
