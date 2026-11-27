import { checkCredentials } from '@/features/auth/domain/credentials'
import { isExpired } from '@/features/auth/domain/session-expiry'
import { LoginUseCase } from '@/features/auth/domain/use-cases/login'
import { RestoreSessionUseCase } from '@/features/auth/domain/use-cases/restore-session'
import { AppError } from '@/shared/domain/app-error'
import { ACCOUNT, makeEnv } from '@tests/helpers/make-env'

const DAY = 24 * 60 * 60 * 1000
const good = { email: ' User@Example.com ', password: ACCOUNT.password, keepSignedIn: false }

describe('checkCredentials', () => {
  it('checks email, its format, then password', () => {
    expect(checkCredentials('  ', '')).toBe('emailRequired')
    expect(checkCredentials('demo', '')).toBe('emailInvalid')
    expect(checkCredentials('demo@example.com', '')).toBe('passwordRequired')
    expect(checkCredentials('demo@example.com', 'x')).toBeUndefined()
  })
})

describe('isExpired', () => {
  const at = (keepSignedIn: boolean) => ({ email: 'a@b.co', signedInAt: 0, keepSignedIn })
  it('is 1 day, or 30 days with "keep me signed in"', () => {
    expect(isExpired(at(false), DAY - 1)).toBe(false)
    expect(isExpired(at(false), DAY)).toBe(true)
    expect(isExpired(at(true), 30 * DAY - 1)).toBe(false)
    expect(isExpired(at(true), 30 * DAY)).toBe(true)
  })
})

describe('LoginUseCase and session', () => {
  it('saves a session with the lower-cased email and no password', async () => {
    const env = makeEnv()
    await new LoginUseCase(env.authRepository, () => 5).execute(good)
    expect(env.getSession.execute()).toEqual({ email: 'user@example.com', signedInAt: 5, keepSignedIn: false })
  })

  it('rejects wrong credentials without creating a session', async () => {
    const env = makeEnv()
    await expect(env.login.execute({ ...good, password: 'nope' })).rejects.toMatchObject({ code: 'invalidCredentials' })
    expect(env.getSession.execute()).toBeUndefined()
  })

  it('reports a server failure as an AppError', async () => {
    const env = makeEnv({ apiError: new AppError('network', 'offline') })
    await expect(env.login.execute(good)).rejects.toBeInstanceOf(AppError)
  })

  it('drops an expired session on restore and remembers the email', async () => {
    const env = makeEnv()
    await new LoginUseCase(env.authRepository, () => 0).execute(good)
    new RestoreSessionUseCase(env.authRepository, () => DAY - 1).execute()
    expect(env.getSession.execute()).toBeDefined()
    new RestoreSessionUseCase(env.authRepository, () => DAY).execute()
    expect(env.getSession.execute()).toBeUndefined()
    expect(env.getSession.lastEmail()).toBe('user@example.com')
  })
})
