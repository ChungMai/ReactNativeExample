import { availableActions, isActionEnabled } from '@/features/networks/domain/network-rules'
import type { JoinedNetwork } from '@/features/networks/domain/entities/network'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'

const network = (over: Partial<JoinedNetwork>): JoinedNetwork =>
  ({ id: 'x', name: 'X', role: 'primary', mode: 'local', primaryUserCount: 1, remoteAccessEnabled: true, ...over })

const loaded = async () => {
  const env = makeEnv()
  await env.refreshNetworks.execute()
  return env
}

describe('network rules', () => {
  it('offers actions by role, access mode and number of primary users', () => {
    expect(availableActions(network({ role: 'secondary' }))).toEqual(['exit'])
    expect(availableActions(network({}))).toEqual(['delete'])
    expect(availableActions(network({ primaryUserCount: 2 }))).toEqual(['delete', 'exit'])
    expect(availableActions(network({ primaryUserCount: 0, mode: 'troubleshoot' }))).toEqual(['exit'])
    expect(availableActions(network({ mode: 'remote' }))).toEqual(['delete', 'exit'])
  })

  it('needs local access to delete and the server for anything', () => {
    expect(isActionEnabled('delete', network({ mode: 'remote' }), true)).toBe(false)
    expect(isActionEnabled('exit', network({ mode: 'remote' }), true)).toBe(true)
    expect(isActionEnabled('exit', network({}), false)).toBe(false)
  })
})

describe('network use cases', () => {
  it('loads joined and nearby networks with their access mode', async () => {
    const env = await loaded()
    expect(env.getNetworks.execute().joined.map(n => n.mode)).toEqual(['local', 'remote', 'remote', 'troubleshoot'])
    expect(env.getNetworks.execute().nearby).toHaveLength(2)
  })

  it('selects a reachable network and refuses the others', async () => {
    const env = await loaded()
    await env.selectNetwork.execute('n2')
    expect(env.getNetworks.active()).toEqual({ id: 'n2', name: 'Beach House', role: 'secondary', mode: 'remote' })
    await expect(env.selectNetwork.execute('n3')).rejects.toMatchObject({ code: 'remoteAccessDenied' })
    await expect(env.selectNetwork.execute('n4')).rejects.toMatchObject({ code: 'unreachable' })
  })

  it('keeps the list when offline and still lets a joined network be opened', async () => {
    const env = await loaded()
    env.networkApi.failWith = new AppError('network', 'offline')
    await expect(env.refreshNetworks.execute()).rejects.toBeInstanceOf(AppError)
    expect(env.getNetworks.execute()).toMatchObject({ serverOnline: false, loaded: true })
    expect(env.getNetworks.execute().joined).toHaveLength(4)
    await env.selectNetwork.execute('n1')
    expect(env.getNetworks.active()?.name).toBe('My Home')
    expect(() => env.joinNetwork.check('n5')).toThrow('offline')
  })

  it('sends one join request, only on the current server', async () => {
    const env = await loaded()
    await env.joinNetwork.execute('n5')
    await expect(env.joinNetwork.execute('n5')).rejects.toMatchObject({ code: 'requestPending' })
    await expect(env.joinNetwork.execute('n6')).rejects.toMatchObject({ code: 'otherServer' })
  })

  it('deletes only with the exact name, and leaves when allowed', async () => {
    const env = await loaded()
    await expect(env.removeNetwork.delete('n1', 'my home')).rejects.toMatchObject({ code: 'nameMismatch' })
    await env.removeNetwork.delete('n1', 'My Home')
    await env.removeNetwork.exit('n2')
    await expect(env.removeNetwork.delete('n3', 'Office')).rejects.toMatchObject({ code: 'accessUnavailable' })
    await env.refreshNetworks.execute()
    expect(env.getNetworks.execute().joined.map(n => n.id)).toEqual(['n3', 'n4'])
  })
})
