// Swift: CognitoSignInHelper.signIn. The SRP flow proves the password is known without sending it.
import { AuthenticationDetails, CognitoUser, CognitoUserPool, type ICognitoStorage } from 'amazon-cognito-identity-js'

export interface CognitoPool {
  userPoolId: string
  clientId: string
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

/** Resolves 'ok', or 'challenge' when Cognito wants another step. Rejects with Cognito's error. */
export function srpSignIn(pool: CognitoPool, email: string, password: string): Promise<'ok' | 'challenge'> {
  const Storage = throwawayStorage()
  const userPool = new CognitoUserPool({
    UserPoolId: pool.userPoolId,
    ClientId: pool.clientId,
    Storage,
    AdvancedSecurityDataCollectionFlag: false,
  })
  const user = new CognitoUser({ Username: email, Pool: userPool, Storage })

  return new Promise((resolve, reject) => {
    const challenge = () => resolve('challenge')
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: () => resolve('ok'),
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
