// What a server says about how to sign in. Swift: fetchAvailableAuthenticationTypes.
import { AppError } from '../../../../shared/domain/app-error'
import { ServerError } from '../../domain/server-error'
import type { CognitoPool } from './cognito-srp'

const TIMEOUT_MS = 15_000
// The library builds the Cognito host from the pool id, so accept only "<aws region>_<id>".
const USER_POOL_ID = /^[a-z]{2}(-gov)?-[a-z]+-\d_[A-Za-z0-9]+$/

/** Throws an AppError (no usable answer) or ServerError('unsupported') (not a Cognito server). */
export async function fetchCognitoPool(serverUrl: string, request: typeof fetch = (...args) => fetch(...args)): Promise<CognitoPool> {
  const server = serverUrl.trim().replace(/\/+$/, '')
  if (!server.startsWith('https://')) throw new AppError('unknown', 'The auth server must use https')

  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
  let body: any
  try {
    const response = await request(`${server}/wmc/auth/types?mobile=ios`, { signal: abort.signal })
    if (!response.ok) throw new AppError('network', `Auth configuration: HTTP ${response.status}`)
    body = await response.json()
  } catch (e) {
    if (e instanceof AppError) throw e
    throw new AppError(abort.signal.aborted ? 'timeout' : 'network', 'Request failed', e)
  } finally {
    clearTimeout(timer)
  }

  if (body?.details?.keycloak) throw new ServerError('unsupported')
  const cognito = body?.details?.cognito?.cognito
  const userPoolId = cognito?.user_pool_id
  const clientId = cognito?.client_id
  if (typeof userPoolId !== 'string' || !USER_POOL_ID.test(userPoolId) || typeof clientId !== 'string' || !clientId) {
    throw new AppError('unknown', 'The server has no usable Cognito configuration')
  }
  return { userPoolId, clientId }
}
