export type NetworkErrorCode =
  | 'offline'
  | 'unreachable'
  | 'remoteAccessDenied'
  | 'otherServer'
  | 'requestPending'
  | 'accessUnavailable'
  | 'nameMismatch'

/** A refusal the UI explains to the user. */
export class NetworkError extends Error {
  constructor(readonly code: NetworkErrorCode) {
    super(code)
    this.name = 'NetworkError'
  }
}
