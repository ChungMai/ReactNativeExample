export interface Session {
  readonly email: string
  readonly signedInAt: number // ms since 1970
  readonly keepSignedIn: boolean
}
