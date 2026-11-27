// A JSON request to the signed-in server with the user's token.
import { AppError } from '../domain/app-error'

const TIMEOUT_MS = 15_000

export interface Credentials {
  /** The server the signed-in user belongs to. */
  server(): string | undefined
  accessToken(): Promise<string>
}

export function createAuthorizedFetch(
  credentials: Credentials,
  /** Called when the server no longer accepts the sign-in. */
  onUnauthorized: (error: unknown) => boolean,
  request: typeof fetch = (...args) => fetch(...args),
) {
  /** GET, or POST when there is a body. The answer must be a JSON object or array. */
  return async function call(path: string, body?: object): Promise<unknown> {
    const server = credentials.server()
    const what = `${body ? 'POST' : 'GET'} ${path.split('?')[0]}`
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
    try {
      const token = await credentials.accessToken()
      // The token goes only to the server it was issued for.
      const response = await request(`${server}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: body && JSON.stringify(body),
        signal: abort.signal,
      })
      if (response.status === 401) onUnauthorized(undefined)
      if (response.status !== 200) throw new AppError('network', `${what}: HTTP ${response.status}`)
      const answer = await response.json()
      if (typeof answer !== 'object' || answer === null) throw new AppError('unknown', `${what}: unexpected answer`)
      return answer
    } catch (e) {
      if (e instanceof AppError || onUnauthorized(e)) throw e
      throw new AppError(abort.signal.aborted ? 'timeout' : 'network', `${what} failed`, e)
    } finally {
      clearTimeout(timer)
    }
  }
}
