// Real sign-in. Swift: fetchAvailableAuthenticationTypes (checkApiConfig) → userLogin.
// The server says which Cognito user pool to use; sign-in then uses SRP (see cognito-srp.ts).
import { AppError } from '../../../../shared/domain/app-error'
import { AuthError } from '../../domain/auth-error'
import type { AuthApi } from './auth-api'
import { fetchCognitoPool } from './auth-server'
import { srpSignIn, type CognitoPool } from './cognito-srp'

type Fetch = typeof fetch

const TIMEOUT_MS = 60_000 // SRP's arithmetic runs in JavaScript: about 10 s in the iOS simulator

export class CognitoAuthApi implements AuthApi {
  private pool?: CognitoPool

  constructor(
    private serverUrl: string,
    private request: Fetch = (...args) => fetch(...args),
    private authenticate = srpSignIn,
  ) {}

  async signIn(email: string, password: string): Promise<boolean> {
    const pool = await this.loadPool()
    try {
      const result = await withTimeout(this.authenticate(pool, email, password))
      if (result === 'challenge') throw new AuthError('challengeRequired') // new password, MFA, ...
      return true
    } catch (e) {
      if (e instanceof AuthError || e instanceof AppError) throw e
      const { code, name, message = '' } = (e ?? {}) as { code?: string; name?: string; message?: string }
      const type = code ?? name ?? ''
      const detail = `${new URL(this.serverUrl.trim()).host} · ${type}: ${message}`

      if (/attempts exceeded/i.test(message) || type === 'TooManyRequestsException') throw new AuthError('tooManyAttempts', detail)
      if (/secret/i.test(message)) throw new AppError('unknown', 'The app client needs a secret')
      if (/USER_SRP_AUTH/.test(message)) throw new AuthError('flowNotEnabled', detail)
      if (type === 'NotAuthorizedException' || type === 'UserNotFoundException') {
        throw new AuthError('invalidCredentials', detail)
      }
      if (type === 'UserNotConfirmedException') throw new AuthError('notConfirmed', detail)
      if (type === 'NetworkError' || /network/i.test(message)) throw new AppError('network', 'Request failed', e)
      throw new AppError('unknown', type || 'Sign-in failed', e)
    }
  }

  private async loadPool(): Promise<CognitoPool> {
    return (this.pool ??= await fetchCognitoPool(this.serverUrl, this.request))
  }
}

function withTimeout<T>(work: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AppError('timeout', 'Sign-in timed out')), TIMEOUT_MS)
    work.then(resolve, reject).finally(() => clearTimeout(timer))
  })
}
