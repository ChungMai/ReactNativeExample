// Swift: CognitoSessionHelper.getAccessToken.
import { AppError } from '../../../../shared/domain/app-error'
import { refreshTokens } from './cognito-srp'
import type { TokenVault } from './token-vault'

const MARGIN_MS = 2 * 60 * 1000

export class SessionExpiredError extends Error {
  constructor() {
    super('The session has expired')
    this.name = 'SessionExpiredError'
  }
}

export class AccessTokenProvider {
  constructor(private vault: TokenVault, private renew = refreshTokens, private now = Date.now) {}

  /** The server the signed-in user belongs to, or undefined without real sign-in (demo account). */
  server = () => this.vault.get()?.server

  /** Throws SessionExpiredError (sign in again) or AppError (try later). */
  async accessToken(): Promise<string> {
    const cached = this.vault.accessToken(this.now() + MARGIN_MS)
    if (cached) return cached
    const stored = this.vault.get()
    if (!stored) throw new SessionExpiredError()
    try {
      const fresh = await this.renew(stored, stored.username, stored.refreshToken)
      this.vault.save({ ...stored, ...fresh })
      return fresh.accessToken
    } catch (e) {
      const { code } = (e ?? {}) as { code?: string }
      if (code === 'NotAuthorizedException' || code === 'UserNotFoundException') throw new SessionExpiredError()
      throw new AppError('network', 'Could not renew the sign-in', e)
    }
  }
}
