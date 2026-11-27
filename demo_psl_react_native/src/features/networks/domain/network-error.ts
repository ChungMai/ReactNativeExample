export type NetworkErrorCode = 'remoteAccessDenied'

/** A refusal the UI explains to the user. */
export class NetworkError extends Error {
  constructor(readonly code: NetworkErrorCode) {
    super(code)
    this.name = 'NetworkError'
  }
}
