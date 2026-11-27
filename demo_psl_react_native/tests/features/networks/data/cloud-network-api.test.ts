// The server is faked; the shapes follow the Swift mapping of NetworkInfo.
import { SessionExpiredError } from '@/features/auth/data/sources/access-token-provider'
import { CachedNetworkRepository } from '@/features/networks/data/cached-network-repository'
import { CloudNetworkApi } from '@/features/networks/data/sources/cloud-network-api'

const ANSWER = [
  { userRole: 'primary', numberOfPrimaryUser: 2, network: { _id: 'a', networkName: 'Lab' }, userProfile: { ras: true } },
  { userRole: 'primary', network: { primaryHub: 'hub-b', networkName: 'Demo room' }, userProfile: { userRole: 'secondary' } },
  { userRole: 'primary', network: {} },
]
const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const reply = (status: number, body: unknown) => jest.fn(async () => ({ status, json: async () => body }) as Response)

describe('CloudNetworkApi', () => {
  it('asks the signed-in server with the token and maps the answer', async () => {
    const request = reply(200, ANSWER)
    const list = await new CloudNetworkApi(credentials, () => false, request).fetchNetworks()
    expect(request).toHaveBeenCalledWith('https://dev.example.test/app/networks', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
    }))
    expect(list).toEqual({
      nearby: [],
      joined: [
        { network_id: 'a', network_name: 'Lab', user_role: 'primary', ras: true, primary_users: 2 },
        { network_id: 'hub-b', network_name: 'Demo room', user_role: 'secondary', ras: false, primary_users: 1 },
      ],
    })
  })

  it('signs out on 401 and reports other failures', async () => {
    const expired = jest.fn(() => true)
    await expect(new CloudNetworkApi(credentials, expired, reply(401, {})).fetchNetworks()).rejects.toThrow('HTTP 401')
    expect(expired).toHaveBeenCalled()
    await expect(new CloudNetworkApi(credentials, () => false, reply(500, {})).fetchNetworks()).rejects.toThrow('HTTP 500')
    await expect(new CloudNetworkApi(credentials, () => false, reply(200, {})).fetchNetworks()).rejects.toThrow('not a list')
  })

  it('passes on an expired sign-in', async () => {
    const dead = { ...credentials, accessToken: async () => { throw new SessionExpiredError() } }
    const api = new CloudNetworkApi(dead, e => e instanceof SessionExpiredError, reply(200, []))
    await expect(api.fetchNetworks()).rejects.toBeInstanceOf(SessionExpiredError)
  })

  it('never deletes or leaves a real network', async () => {
    const request = reply(200, ANSWER)
    const repository = new CachedNetworkRepository(new CloudNetworkApi(credentials, () => false, request))
    await repository.refresh()
    expect(repository.getList()).toMatchObject({ readOnly: true, serverOnline: true })
    await expect(repository.delete('a')).rejects.toThrow('read only')
    await expect(repository.exit('a')).rejects.toThrow('read only')
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('forgets the list on reset, even if an answer is still on its way', async () => {
    const repository = new CachedNetworkRepository(new CloudNetworkApi(credentials, () => false, reply(200, ANSWER)))
    const pending = repository.refresh()
    repository.reset()
    await pending
    expect(repository.getList()).toMatchObject({ joined: [], loaded: false })
  })
})
