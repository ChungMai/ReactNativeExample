// Runs the real client library against a fake Cognito that verifies the SRP signature.
import { srpSignIn } from '@/features/auth/data/sources/cognito-srp'
import { fakeCognito } from '@tests/helpers/fake-cognito'

jest.mock('amazon-cognito-identity-js/lib/utils/cryptoSecureRandomInt', () => ({
  __esModule: true,
  default: () => jest.requireActual('crypto').randomInt(0, 2 ** 32 - 1),
}))

const pool = { userPoolId: 'us-east-1_TestPool', clientId: 'test-client' }
const realFetch = global.fetch
afterEach(() => { global.fetch = realFetch })

function serve(password: string) {
  const answer = fakeCognito(pool.userPoolId, password)
  global.fetch = (async (_url: any, init: any) => {
    const { status, data } = answer(JSON.parse(init.body))
    return { ok: status < 300, status, json: async () => data, headers: { get: () => null } }
  }) as unknown as typeof fetch
}

describe('SRP signature', () => {
  // One round each: the arithmetic is slow. Raise the count when changing how SRP is done.
  it.each(['Plain-pass1', 'Sp$c!al@Chars#9', 'mật khẩu có dấu 1A'])('is accepted for the right password (%s)', async password => {
    serve(password)
    for (let round = 0; round < 1; round++) {
      await expect(srpSignIn(pool, 'someone@example.com', password)).resolves.toBe('ok')
    }
  }, 60_000)

  it('is rejected for a wrong password', async () => {
    serve('Right-pass1')
    await expect(srpSignIn(pool, 'someone@example.com', 'Wrong-pass1')).rejects.toMatchObject({ code: 'NotAuthorizedException' })
  })
})
