// Swift: confirmAndLoginUser → userLogin → showSignInOK.
import { toAppError } from '../../../../shared/domain/app-error'
import { AuthError } from '../auth-error'
import { checkCredentials, normaliseEmail } from '../credentials'
import type { AuthRepository } from '../repositories/auth-repository'

export interface LoginInput {
  email: string
  password: string
  keepSignedIn: boolean
}

export class LoginUseCase {
  constructor(private repository: AuthRepository, private now: () => number = Date.now) {}

  /** Throws an AuthError (bad input or credentials) or an AppError. The password is never stored. */
  async execute({ email, password, keepSignedIn }: LoginInput): Promise<void> {
    const invalid = checkCredentials(email, password)
    if (invalid) throw new AuthError(invalid)
    const address = normaliseEmail(email)
    try {
      await this.repository.verify(address, password)
    } catch (e) {
      throw e instanceof AuthError ? e : toAppError(e)
    }
    this.repository.saveSession({ email: address, keepSignedIn, signedInAt: this.now() })
  }
}
