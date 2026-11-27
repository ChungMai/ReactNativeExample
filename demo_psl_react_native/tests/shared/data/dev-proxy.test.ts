// The development proxy for the web app. No server is contacted.
const { createDevProxy } = jest.requireActual('../../../dev-proxy')

const TARGET = 'https://dev.example.test/app/networks'

async function call(over: { body?: string; url?: string; method?: string; address?: string; headers?: Record<string, string> } = {}, answer: any = {}) {
  const request = jest.fn(async () => ({
    status: 200, headers: { get: () => 'application/json' }, text: async () => '[]', ...answer,
  }))
  const result = { status: 0, body: '', passedOn: false, request }
  const req = {
    async *[Symbol.asyncIterator]() { if (over.body) yield over.body },
    url: over.url ?? `/__dev-proxy?url=${encodeURIComponent(TARGET)}`,
    method: over.method ?? 'GET',
    socket: { remoteAddress: over.address ?? '127.0.0.1' },
    headers: { host: 'localhost:8081', 'sec-fetch-site': 'same-origin', authorization: 'Bearer made-up', cookie: 'secret', ...over.headers },
  }
  const res = { writeHead: (status: number) => { result.status = status }, end: (body: string) => { result.body = body } }
  await createDevProxy({ suffixes: ['.example.test'], request })(req, res, () => { result.passedOn = true })
  return result
}
const to = (url: string) => ({ url: `/__dev-proxy?url=${encodeURIComponent(url)}` })

describe('dev proxy', () => {
  it('forwards an allowed request with only the headers it needs', async () => {
    const result = await call()
    expect(result).toMatchObject({ status: 200, body: '[]' })
    const [url, init] = result.request.mock.calls[0] as unknown as [URL, RequestInit]
    expect(String(url)).toBe(TARGET)
    expect(init.headers).toEqual({ Accept: 'application/json', Authorization: 'Bearer made-up' })
    expect(init.redirect).toBe('manual')
  })

  it('leaves other requests to Metro', async () => {
    expect((await call({ url: '/index.bundle?platform=web' })).passedOn).toBe(true)
  })

  it.each([
    ['another domain', to('https://evil.test/app/networks')],
    ['a look-alike domain', to('https://evilexample.test/app/networks')],
    ['http', to('http://dev.example.test/app/networks')],
    ['another path', to('https://dev.example.test/app/networks/users')],
    ['a path trick', to('https://dev.example.test/app/networks/../users')],
    ['a port', to('https://dev.example.test:8443/app/networks')],
    ['a write', { method: 'DELETE' }],
    ['a machine on the LAN', { address: '192.168.1.20' }],
    ['another web site', { headers: { 'sec-fetch-site': 'cross-site' } }],
    ['a rebound host name', { headers: { host: 'attacker.test' } }],
  ])('refuses %s', async (_name, over) => {
    const result = await call(over)
    expect(result.status).toBe(403)
    expect(result.request).not.toHaveBeenCalled()
  })

  const OBJECTS = 'https://dev.example.test/api/bridge/hub-1/objects'

  it('forwards the POST that reads the Home objects', async () => {
    const result = await call({ ...to(OBJECTS), method: 'POST', body: '{"0010":8}' })
    expect(result.status).toBe(200)
    expect(result.request).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'POST', body: '{"0010":8}' }))
  })

  const BRIDGE = 'https://dev.example.test/api/bridge/hub-1'

  it('forwards the reads of the rooms, and nothing else about a group', async () => {
    expect((await call(to(`${BRIDGE}/groups/0`))).status).toBe(200)
    expect((await call(to(`${BRIDGE}/groups`))).status).toBe(200)
    expect((await call(to(`${BRIDGE}/groups/12/memberof`))).status).toBe(200)
    expect((await call(to(`${BRIDGE}/groups/12`))).status).toBe(403)
    expect((await call({ ...to(`${BRIDGE}/groups/12`), method: 'POST', body: '{"0010":0}' })).status).toBe(403)
  })

  it('forwards the lists of the More menu, but nothing that acts on them', async () => {
    for (const list of ['zones', 'presets', 'scenes', 'events', 'hubs']) {
      expect((await call(to(`${BRIDGE}/${list}`))).status).toBe(200)
      expect((await call(to(`${BRIDGE}/${list}/4`))).status).toBe(403)
      expect((await call({ ...to(`${BRIDGE}/${list}`), method: 'POST', body: '{"0010":0}' })).status).toBe(403)
    }
  })

  it('reads the users, but refuses a body that would change one', async () => {
    const users = { ...to('https://dev.example.test/app/networks/users/all'), method: 'POST' }
    const network = { networkName: 'Lab', primaryHub: 'hub-1' }
    expect((await call({ ...users, body: JSON.stringify({ network }) })).status).toBe(200)
    for (const body of [{ network, userRole: 'primary' }, { network: { ...network, user: 'x' } }, { user: 'x' }]) {
      expect((await call({ ...users, body: JSON.stringify(body) })).status).toBe(403)
    }
  })

  it('reads the energy of a day', async () => {
    const day = 'https://dev.example.test/ec/api/n1/energy-meter/date/01-02-2026?totalDeviceId=5'
    expect((await call(to(day))).status).toBe(200)
    expect((await call(to('https://dev.example.test/ec/api/n1/energy-meter/reset'))).status).toBe(403)
  })

  const DEVICES = 'https://dev.example.test/api/bridge/hub-1/accessories'

  it('forwards the POST that reads the devices, and no other operation there', async () => {
    expect((await call({ ...to(DEVICES), method: 'POST', body: '{"0010":23}' })).status).toBe(200)
    expect((await call({ ...to(DEVICES), method: 'POST', body: '{"0010":8}' })).status).toBe(403)
  })

  it.each([
    ['another operation', OBJECTS, '{"0010":0}'],
    ['a body that is not JSON', OBJECTS, 'on'],
    ['a trigger path', 'https://dev.example.test/api/bridge/hub-1/zones/4', '{"0010":8}'],
  ])('refuses a POST with %s', async (_name, url, body) => {
    const result = await call({ ...to(url), method: 'POST', body })
    expect(result.status).toBe(403)
    expect(result.request).not.toHaveBeenCalled()
  })

  it('does not follow a redirect', async () => {
    expect((await call({}, { status: 302 })).status).toBe(502)
  })
})
