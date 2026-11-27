import type { CredentialsError } from './credentials'

export type AuthErrorCode =
  | CredentialsError
  | 'invalidCredentials'
  | 'notConfirmed'
  | 'challengeRequired'
  | 'tooManyAttempts'
  | 'flowNotEnabled'
  | 'noServer'

/** A login failure the user can fix. Connection problems stay AppError. */
export class AuthError extends Error {
  /** `detail` is technical text from the server, for developers. Never put credentials in it. */
  constructor(readonly code: AuthErrorCode, readonly detail?: string) {
    super(code)
    this.name = 'AuthError'
  }
}
