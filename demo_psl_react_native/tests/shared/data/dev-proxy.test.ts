// The development proxy for the web app. No server is contacted.
const { createDevProxy } = jest.requireActual('../../../dev-proxy')

const TARGET = 'https://dev.example.test/app/networks'

async function call(over: { url?: string; method?: string; address?: string; headers?: Record<string, string> } = {}, answer: any = {}) {
  const request = jest.fn(async () => ({
    status: 200, headers: { get: () => 'application/json' }, text: async () => '[]', ...answer,
  }))
  const result = { status: 0, body: '', passedOn: false, request }
  const req = {
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

  it('does not follow a redirect', async () => {
    expect((await call({}, { status: 302 })).status).toBe(502)
  })
})
