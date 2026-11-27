import type { AppError } from '../../../../shared/domain/app-error'

/** The only account the stub accepts. It is test data, shown on the login screen. */
export const DEMO_ACCOUNT = { email: 'demo@example.com', password: 'demo1234' }

export interface AuthApi {
  /** false: wrong email or password. */
  signIn(email: string, password: string): Promise<boolean>
}

/** Stub for the identity server. Replace the body with a real request when an API exists. */
export class FakeAuthApi implements AuthApi {
  /** Pass an AppError to make every request fail. */
  constructor(private failWith?: AppError) {}

  async signIn(email: string, password: string) {
    if (this.failWith) throw this.failWith
    return email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password
  }
}
