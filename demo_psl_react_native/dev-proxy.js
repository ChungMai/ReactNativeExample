// DEVELOPMENT ONLY. Browsers block calls to a server that sends no CORS headers; the web app therefore
// asks the Expo dev server, which asks the real server. A deployed web build does not use this.
// It is deliberately narrow, because the second call carries the user's access token.
const PATH = '/__dev-proxy'
const TIMEOUT_MS = 15_000
// the only things the app reads: the sign-in configuration, the network list, Home, Devices, Rooms, Groups and More
const ALLOWED_PATHS = ['/wmc/auth/types', '/app/networks', '/app/networks/users/']
// Groups, and Rooms: the list and the members of one room.
const ROOM_PATHS = /^\/api\/bridge\/[A-Za-z0-9_-]+\/groups(\/(0|\d+\/memberof))?$/
// Some reads are POSTs. Only these paths, each only with a body that reads: the user list path, for one,
// also changes users when it is sent something else.
const operation = code => body => body['0010'] === code
const onlyTheNetwork = body =>
  Object.keys(body).join() === 'network' && Object.keys(body.network ?? {}).sort().join() === 'networkName,primaryHub'
const READS = [
  { path: /^\/api\/bridge\/[A-Za-z0-9_-]+\/objects$/, accepts: operation(8) }, // get list
  { path: /^\/api\/bridge\/[A-Za-z0-9_-]+\/accessories$/, accepts: operation(23) }, // filter devices
  { path: /^\/app\/networks\/users\/all$/, accepts: onlyTheNetwork },
]
// the energy of a meter, hour by hour
const ENERGY_PATH = /^\/ec\/api\/[A-Za-z0-9_-]+\/energy-meter\/date\/\d{2}-\d{2}-\d{4}$/
// the lists of the More menu
const MORE_PATHS = /^\/api\/bridge\/[A-Za-z0-9_-]+\/(zones|presets|scenes|events|hubs)$/
const readOf = pathname => READS.find(r => r.path.test(pathname))
const MAX_BODY = 32 * 1024
const LOOPBACK = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/

/** `suffixes` like ".example.com": only those https servers may be reached. */
function targetOf(requestUrl, suffixes, method) {
  try {
    const target = new URL(new URL(requestUrl, 'http://localhost').searchParams.get('url'))
    const hostAllowed = suffixes.some(s => s.startsWith('.') && target.hostname.endsWith(s))
    const plain = target.protocol === 'https:' && !target.username && !target.password && !target.port
    const pathAllowed = method === 'POST' ? readOf(target.pathname) !== undefined : ALLOWED_PATHS.includes(target.pathname) || ROOM_PATHS.test(target.pathname) || MORE_PATHS.test(target.pathname) || ENERGY_PATH.test(target.pathname)
    return plain && hostAllowed && pathAllowed ? target : undefined
  } catch {
    return undefined
  }
}

/** The body of a request that only reads, otherwise undefined. */
async function readOnlyBody(req, accepts) {
  let text = ''
  try {
    for await (const chunk of req) {
      text += chunk
      if (text.length > MAX_BODY) return undefined
    }
    return accepts(JSON.parse(text)) ? text : undefined
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
    if (!local || !['GET', 'POST'].includes(req.method)) return reply(403, 'Refused')
    const target = targetOf(req.url, suffixes, req.method)
    if (!target) return reply(403, 'This address is not allowed. See DEV_PROXY_ALLOWED_HOSTS in .env.example.')

    const headers = { Accept: 'application/json' }
    if (req.headers.authorization) headers.Authorization = req.headers.authorization
    let body
    if (req.method === 'POST') {
      body = await readOnlyBody(req, readOf(target.pathname).accepts)
      if (body === undefined) return reply(403, 'Refused')
      headers['Content-Type'] = 'application/json'
    }
    try {
      // a redirect is not followed: it could take the token somewhere else
      const response = await request(target, { method: req.method, body, headers, redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (response.status >= 300 && response.status < 400) return reply(502, 'The server redirected')
      reply(response.status, await response.text(), response.headers.get('content-type') ?? 'text/plain')
    } catch {
      reply(502, 'The server could not be reached')
    }
  }
}

module.exports = { createDevProxy, PATH }
