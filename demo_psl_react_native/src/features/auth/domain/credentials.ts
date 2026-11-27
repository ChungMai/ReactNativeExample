// Swift: LoginViewPresenter.validateRegisterUserCredentials. The order of the checks matters.
export const EMAIL_MAX_LENGTH = 320

export type CredentialsError = 'emailRequired' | 'emailInvalid' | 'passwordRequired'

const EMAIL = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,20}/

export const normaliseEmail = (email: string) => email.trim().toLowerCase()

export function checkCredentials(email: string, password: string): CredentialsError | undefined {
  const address = normaliseEmail(email)
  if (!address) return 'emailRequired'
  if (!EMAIL.test(address)) return 'emailInvalid'
  if (!password) return 'passwordRequired'
  return undefined
}
