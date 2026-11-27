// The Cognito tokens of the signed-in user. Swift: the AWS SDK keeps these in the Keychain.
import type { TextStorage } from './session-store'

/** What is needed to get a new access token, and which server the tokens belong to. */
export interface TokenOwner {
  server: string
  userPoolId: string
  clientId: string
  username: string
}

export interface TokenSet extends TokenOwner {
  accessToken: string
  accessExpiresAt: number // ms since 1970
  refreshToken: string
}

type Stored = TokenOwner & { refreshToken: string }

/**
 * Only the refresh token and its owner are persisted, as two values: iOS limits the size of a
 * Keychain value. The short-lived access token stays in memory and is fetched again after a restart.
 */
export class TokenVault {
  private access?: { token: string; expiresAt: number }
  private stored?: Stored

  constructor(private owner: TextStorage, private refresh: TextStorage) {
    try {
      const value = JSON.parse(owner.read() ?? 'null') as Partial<TokenOwner> | null
      const refreshToken = refresh.read()
      if (refreshToken && value?.server?.startsWith('https://') && value.userPoolId && value.clientId && value.username) {
        this.stored = { ...(value as TokenOwner), refreshToken }
      }
    } catch {
      // unreadable: behave as signed out
    }
  }

  get = () => this.stored
  accessToken = (validUntil: number) => (this.access && this.access.expiresAt > validUntil ? this.access.token : undefined)

  save({ accessToken, accessExpiresAt, refreshToken, ...owner }: TokenSet) {
    this.access = { token: accessToken, expiresAt: accessExpiresAt }
    this.stored = { ...owner, refreshToken }
    this.write(JSON.stringify(owner), refreshToken)
  }

  clear() {
    this.access = undefined
    this.stored = undefined
    this.write('', '')
  }

  private write(owner: string, refreshToken: string) {
    try {
      this.owner.write(owner)
      this.refresh.write(refreshToken)
    } catch (e) {
      console.warn('Could not save the tokens', e instanceof Error ? e.message : '')
    }
  }
}
