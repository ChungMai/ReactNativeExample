// The network is faked: these tests never reach a server, and use made-up values only.
// The SRP tests run the real library against a fake Cognito.
import { CognitoAuthApi } from '@/features/auth/data/sources/cognito-auth-api'

// Under Jest the library's native random source does not exist (the app redirects it in metro.config.js).
jest.mock('amazon-cognito-identity-js/lib/utils/cryptoSecureRandomInt', () => ({
  __esModule: true,
  default: () => jest.requireActual('crypto').randomInt(0, 2 ** 32 - 1),
}))

const POOL = { user_pool_id: 'us-east-1_TestPool', client_id: 'test-client', region: 'us-east-1' }
const CONFIG = { details: { cognito: { cognito: POOL } } }
const reply = (body: unknown, status = 200) => ({ ok: status < 300, status, json: async () => body }) as Response
const server = (config: unknown = CONFIG) => jest.fn(async () => reply(config))
const PASSWORD = 'made-up-password'

function api(authenticate: () => Promise<'ok' | 'challenge'>, request = server()) {
  return new CognitoAuthApi('https://auth.example.test/', request, authenticate)
}
const failing = (code: string, message = '') => api(async () => { throw { code, message } })

describe('CognitoAuthApi', () => {
  it('reads the pool from the server once and passes it to the sign-in', async () => {
    const request = server()
    const authenticate = jest.fn(async () => 'ok' as const)
    const auth = new CognitoAuthApi('https://auth.example.test/', request, authenticate)
    await expect(auth.signIn('someone@example.com', PASSWORD)).resolves.toBe(true)
    await auth.signIn('someone@example.com', PASSWORD)

    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith('https://auth.example.test/wmc/auth/types?mobile=ios', expect.anything())
    expect(authenticate).toHaveBeenCalledWith(
      { userPoolId: 'us-east-1_TestPool', clientId: 'test-client' }, 'someone@example.com', PASSWORD)
  })

  it.each(['NotAuthorizedException', 'UserNotFoundException'])('treats %s as wrong credentials', async code => {
    await expect(failing(code, 'Incorrect username or password.').signIn('a@b.co', PASSWORD)).rejects.toMatchObject({
      code: 'invalidCredentials',
      detail: `auth.example.test · ${code}: Incorrect username or password.`,
    })
  })

  it.each([
    ['UserNotConfirmedException', '', 'notConfirmed'],
    ['NotAuthorizedException', 'Password attempts exceeded', 'tooManyAttempts'],
    ['InvalidParameterException', 'USER_SRP_AUTH is not enabled for the client.', 'flowNotEnabled'],
    ['NetworkError', 'Network error', 'network'],
  ])('explains %s %s', async (type, message, code) => {
    await expect(failing(type, message).signIn('a@b.co', PASSWORD)).rejects.toMatchObject({ code })
  })

  it('reports a second step it cannot do', async () => {
    await expect(api(async () => 'challenge').signIn('a@b.co', PASSWORD)).rejects.toMatchObject({ code: 'challengeRequired' })
  })

  it('does not sign in when the pool id could point somewhere else', async () => {
    const authenticate = jest.fn()
    const bad = server({ details: { cognito: { cognito: { ...POOL, user_pool_id: 'evil.example/x_1' } } } })
    await expect(new CognitoAuthApi('https://auth.example.test', bad, authenticate).signIn('a@b.co', PASSWORD))
      .rejects.toMatchObject({ code: 'unknown' })
    expect(authenticate).not.toHaveBeenCalled()
  })

  it('refuses a server without https', async () => {
    await expect(new CognitoAuthApi('http://auth.example.test').signIn('a@b.co', PASSWORD)).rejects.toThrow('https')
  })
})

describe('SRP sign-in with the real library', () => {
  const realFetch = global.fetch
  afterEach(() => { global.fetch = realFetch })

  const jwt = `x.${Buffer.from(JSON.stringify({ exp: 4102444800, iat: 0, username: 'u' })).toString('base64url')}.x`

  function fakeCognito() {
    const calls: { url: string; target: string; body: any; raw: string }[] = []
    global.fetch = jest.fn(async (url: any, init: any) => {
      const target = init.headers['X-Amz-Target'].split('.').pop()
      calls.push({ url: String(url), target, body: JSON.parse(init.body), raw: init.body })
      const answer = target === 'InitiateAuth'
        ? {
            ChallengeName: 'PASSWORD_VERIFIER',
            ChallengeParameters: { SRP_B: 'ab'.repeat(128), SALT: 'cd'.repeat(16), SECRET_BLOCK: 'c2VjcmV0', USER_ID_FOR_SRP: 'u' },
          }
        : { AuthenticationResult: { AccessToken: jwt, IdToken: jwt, RefreshToken: 'r', TokenType: 'Bearer' }, ChallengeParameters: {} }
      return reply(answer)
    }) as typeof fetch
    return calls
  }

  it('uses SRP against the pool region and never sends the password', async () => {
    const calls = fakeCognito()
    const auth = new CognitoAuthApi('https://auth.example.test', server())
    await expect(auth.signIn('someone@example.com', PASSWORD)).resolves.toBe(true)

    expect(calls.map(c => c.target)).toEqual(['InitiateAuth', 'RespondToAuthChallenge'])
    expect(calls[0].url).toBe('https://cognito-idp.us-east-1.amazonaws.com/')
    expect(calls[0].body.AuthFlow).toBe('USER_SRP_AUTH')
    expect(calls.every(c => !c.raw.includes(PASSWORD))).toBe(true)
  })
})
