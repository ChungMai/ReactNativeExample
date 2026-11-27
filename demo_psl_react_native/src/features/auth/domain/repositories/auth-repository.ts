import type { Session } from '../entities/session'

export interface AuthRepository {
  /** Must return the same reference until it changes. */
  getSession(): Session | undefined
  /** The email of the last successful login, to prefill the form. */
  getLastEmail(): string | undefined
  subscribe(listener: () => void): () => void
  /** Checks the credentials with the server. Throws AuthError or AppError. */
  verify(email: string, password: string): Promise<void>
  saveSession(session: Session): void
  clearSession(): void
}
