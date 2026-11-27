export interface AuthApi {
  /** false: wrong email or password. */
  signIn(email: string, password: string): Promise<boolean>
}
