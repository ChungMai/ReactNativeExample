import { SelectedServerAuthApi } from '@/features/auth/data/sources/selected-server-auth-api'
import { StoredServerRepository } from '@/features/auth/data/stored-server-repository'
import { checkServerAddress } from '@/features/auth/domain/server-address'
import { ServerError } from '@/features/auth/domain/server-error'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'

describe('checkServerAddress', () => {
  it.each([
    [' Dev.Example.test/ ', 'https://dev.example.test'],
    ['https://10.0.0.5:8443', 'https://10.0.0.5:8443'],
  ])('accepts %s', (input, url) => expect(checkServerAddress(input)).toEqual({ url }))

  it('asks for an address', () => expect(checkServerAddress('  ')).toEqual({ error: 'empty' }))

  it.each(['http://dev.example.test', 'localhost', '10.0.0.999', 'user@example.test', 'example.test/path', 'a b.test'])(
    'refuses %s', input => expect(checkServerAddress(input)).toEqual({ error: 'invalid' }))
})

describe('server use cases', () => {
  const url = 'https://dev.example.test'

  it('selects and remembers a server only after it answered', async () => {
    const env = makeEnv()
    env.verifyServer.mockRejectedValueOnce(new AppError('network', 'down'))
    await expect(env.connectServer.execute('dev.example.test')).rejects.toMatchObject({ code: 'unreachable' })
    expect(env.getServerSettings.execute()).toEqual({ saved: [] })

    await env.connectServer.execute('dev.example.test')
    await env.connectServer.execute(url)
    expect(env.getServerSettings.execute()).toEqual({ selected: url, saved: [url] })

    env.connectServer.useDefault()
    expect(env.getServerSettings.execute()).toEqual({ saved: [url] })
  })

  it('keeps the reason when the server cannot be used', async () => {
    const env = makeEnv()
    env.verifyServer.mockRejectedValueOnce(new ServerError('unsupported'))
    await expect(env.connectServer.execute(url)).rejects.toMatchObject({ code: 'unsupported' })
  })

  it('goes back to the default server when the one in use is removed', async () => {
    const env = makeEnv()
    await env.connectServer.execute(url)
    env.removeServer.execute(url)
    expect(env.getServerSettings.execute()).toEqual({ selected: undefined, saved: [] })
  })

  it('ignores stored addresses it would not accept', () => {
    const stored = JSON.stringify({ selected: 'http://evil.test', saved: [url, 'javascript:alert(1)', 5] })
    const repository = new StoredServerRepository({ read: () => stored, write: () => {} }, async () => {})
    expect(repository.get()).toEqual({ selected: undefined, saved: [url] })
  })
})

describe('SelectedServerAuthApi', () => {
  it('signs in against the selected server, else the default one, else the demo account', async () => {
    let selected: string | undefined
    const used: string[] = []
    const api = (name: string) => ({ signIn: async () => { used.push(name); return true } })
    const settings = () => ({ selected, saved: [] })
    const withDefault = new SelectedServerAuthApi(settings, 'https://prod.example.test', api, api('demo'))
    const withoutDefault = new SelectedServerAuthApi(settings, undefined, api, api('demo'))

    await withDefault.signIn('a@b.co', 'x')
    await withoutDefault.signIn('a@b.co', 'x')
    selected = 'https://dev.example.test'
    await withDefault.signIn('a@b.co', 'x')
    expect(used).toEqual(['https://prod.example.test', 'demo', 'https://dev.example.test'])
  })
})
