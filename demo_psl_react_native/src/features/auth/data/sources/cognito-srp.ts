// Swift: CognitoSignInHelper.signIn. The SRP flow proves the password is known without sending it.
import {
  AuthenticationDetails, CognitoRefreshToken, CognitoUser, CognitoUserPool,
  type CognitoUserSession, type ICognitoStorage,
} from 'amazon-cognito-identity-js'

export interface CognitoPool {
  userPoolId: string
  clientId: string
}

export interface CognitoTokens {
  username: string
  accessToken: string
  accessExpiresAt: number
  refreshToken: string
}

/** The library saves tokens somewhere. This keeps them in memory and drops them with the object. */
function throwawayStorage(): ICognitoStorage {
  const items = new Map<string, string>()
  return {
    setItem: (key, value) => { items.set(key, value) },
    getItem: key => items.get(key) ?? null,
    removeItem: key => { items.delete(key) },
    clear: () => items.clear(),
  }
}

function cognitoUser(pool: CognitoPool, username: string): CognitoUser {
  const Storage = throwawayStorage()
  const userPool = new CognitoUserPool({
    UserPoolId: pool.userPoolId,
    ClientId: pool.clientId,
    Storage,
    AdvancedSecurityDataCollectionFlag: false,
  })
  return new CognitoUser({ Username: username, Pool: userPool, Storage })
}

const tokensOf = (user: CognitoUser, session: CognitoUserSession): CognitoTokens => ({
  username: user.getUsername(),
  accessToken: session.getAccessToken().getJwtToken(),
  accessExpiresAt: session.getAccessToken().getExpiration() * 1000,
  refreshToken: session.getRefreshToken().getToken(),
})

/** Resolves with the tokens, or 'challenge' when Cognito wants another step. Rejects with Cognito's error. */
export function srpSignIn(pool: CognitoPool, email: string, password: string): Promise<CognitoTokens | 'challenge'> {
  const user = cognitoUser(pool, email)

  return new Promise((resolve, reject) => {
    const challenge = () => resolve('challenge')
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: session => resolve(tokensOf(user, session)),
      onFailure: reject,
      newPasswordRequired: challenge,
      mfaRequired: challenge,
      totpRequired: challenge,
      mfaSetup: challenge,
      selectMFAType: challenge,
      customChallenge: challenge,
    })
  })
}

/** Gets a new access token. Rejects with Cognito's error. */
export function refreshTokens(pool: CognitoPool, username: string, refreshToken: string): Promise<CognitoTokens> {
  const user = cognitoUser(pool, username)
  return new Promise((resolve, reject) => {
    user.refreshSession(new CognitoRefreshToken({ RefreshToken: refreshToken }), (error, session) => {
      if (error) reject(error)
      else resolve(tokensOf(user, session))
    })
  })
}
