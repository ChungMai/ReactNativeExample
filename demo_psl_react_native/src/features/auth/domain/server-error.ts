import type { AddressError } from './server-address'

/** `unsupported`: the server answers, but offers a sign-in method this app does not have. */
export type ServerErrorCode = AddressError | 'unreachable' | 'unsupported'

export class ServerError extends Error {
  constructor(readonly code: ServerErrorCode) {
    super(code)
    this.name = 'ServerError'
  }
}
