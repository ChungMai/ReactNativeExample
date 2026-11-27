// DEVELOPMENT ONLY. Browsers block calls to a server that sends no CORS headers; the web app therefore
// asks the Expo dev server, which asks the real server. A deployed web build does not use this.
// It is deliberately narrow, because the second call carries the user's access token.
const PATH = '/__dev-proxy'
const TIMEOUT_MS = 15_000
// the only things the app reads: the sign-in configuration and the network list
const ALLOWED_PATHS = ['/wmc/auth/types', '/app/networks']
const LOOPBACK = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/

/** `suffixes` like ".example.com": only those https servers may be reached. */
function targetOf(requestUrl, suffixes) {
  try {
    const target = new URL(new URL(requestUrl, 'http://localhost').searchParams.get('url'))
    const hostAllowed = suffixes.some(s => s.startsWith('.') && target.hostname.endsWith(s))
    const plain = target.protocol === 'https:' && !target.username && !target.password && !target.port
    return plain && hostAllowed && ALLOWED_PATHS.includes(target.pathname) ? target : undefined
  } catch {
    return undefined
  }
}

function createDevProxy({ suffixes, request = (...args) => fetch(...args) }) {
  return async function devProxy(req, res, next) {
    if (!req.url.startsWith(`${PATH}?`)) return next()
    const reply = (status, body = '', type = 'text/plain') => {
      res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
      res.end(body)
    }
    // Only this machine's browser, on a page served by this server (not other sites, not the LAN).
    const local =
      LOOPBACK.includes(req.socket.remoteAddress) &&
      LOCAL_HOST.test(req.headers.host ?? '') &&
      req.headers['sec-fetch-site'] === 'same-origin'
    if (!local || req.method !== 'GET') return reply(403, 'Refused')
    const target = targetOf(req.url, suffixes)
    if (!target) return reply(403, 'This address is not allowed. See DEV_PROXY_ALLOWED_HOSTS in .env.example.')

    const headers = { Accept: 'application/json' }
    if (req.headers.authorization) headers.Authorization = req.headers.authorization
    try {
      // a redirect is not followed: it could take the token somewhere else
      const response = await request(target, { headers, redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (response.status >= 300 && response.status < 400) return reply(502, 'The server redirected')
      reply(response.status, await response.text(), response.headers.get('content-type') ?? 'text/plain')
    } catch {
      reply(502, 'The server could not be reached')
    }
  }
}

module.exports = { createDevProxy, PATH }
