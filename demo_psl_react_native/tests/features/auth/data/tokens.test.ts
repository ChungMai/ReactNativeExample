// Made-up values only.
import { AccessTokenProvider, SessionExpiredError } from '@/features/auth/data/sources/access-token-provider'
import { TokenVault, type TokenSet } from '@/features/auth/data/sources/token-vault'

const MIN = 60_000
const TOKENS: TokenSet = {
  server: 'https://dev.example.test', userPoolId: 'us-east-1_P', clientId: 'c', username: 'u',
  accessToken: 'access-1', accessExpiresAt: 60 * MIN, refreshToken: 'refresh-1',
}
function disk() {
  let value: string | null = null
  return { read: () => value, write: (v: string) => { value = v } }
}

describe('TokenVault', () => {
  it('persists the refresh token and its owner, never the access token', () => {
    const owner = disk()
    const refresh = disk()
    new TokenVault(owner, refresh).save(TOKENS)
    expect(owner.read()! + refresh.read()).not.toContain('access-1')
    const restarted = new TokenVault(owner, refresh)
    expect(restarted.get()).toMatchObject({ server: TOKENS.server, refreshToken: 'refresh-1' })
    expect(restarted.accessToken(0)).toBeUndefined()
  })

  it('forgets everything on clear', () => {
    const owner = disk()
    const refresh = disk()
    const vault = new TokenVault(owner, refresh)
    vault.save(TOKENS)
    vault.clear()
    expect(new TokenVault(owner, refresh).get()).toBeUndefined()
  })
})

describe('AccessTokenProvider', () => {
  const setup = (renew: jest.Mock, now = 0) => {
    const vault = new TokenVault(disk(), disk())
    vault.save(TOKENS)
    return new AccessTokenProvider(vault, renew, () => now)
  }

  it('reuses a token that is still valid', async () => {
    const renew = jest.fn()
    await expect(setup(renew).accessToken()).resolves.toBe('access-1')
    expect(renew).not.toHaveBeenCalled()
  })

  it('renews one that is about to expire', async () => {
    const renew = jest.fn(async () => ({ ...TOKENS, accessToken: 'access-2', accessExpiresAt: 120 * MIN }))
    await expect(setup(renew, 59 * MIN).accessToken()).resolves.toBe('access-2')
    expect(renew).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'c' }), 'u', 'refresh-1')
  })

  it('tells a rejected refresh token apart from a network problem', async () => {
    const rejected = jest.fn(async () => { throw { code: 'NotAuthorizedException' } })
    await expect(setup(rejected, 59 * MIN).accessToken()).rejects.toBeInstanceOf(SessionExpiredError)
    const offline = jest.fn(async () => { throw { code: 'NetworkError' } })
    await expect(setup(offline, 59 * MIN).accessToken()).rejects.toMatchObject({ code: 'network' })
  })
})
