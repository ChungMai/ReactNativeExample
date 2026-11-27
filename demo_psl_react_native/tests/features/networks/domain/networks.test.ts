import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'

const loaded = async () => {
  const env = makeEnv()
  await env.refreshNetworks.execute()
  return env
}

describe('network use cases', () => {
  it('selects a network with remote access and refuses one without', async () => {
    const env = await loaded()
    expect(() => env.selectNetwork.execute('n2')).toThrow('remoteAccessDenied')
    env.selectNetwork.execute('n1')
    expect(env.getNetworks.active()).toEqual({ id: 'n1', name: 'Lab', role: 'primary' })
    env.leaveActiveNetwork.execute()
    expect(env.getNetworks.active()).toBeUndefined()
  })

  it('keeps the list when offline', async () => {
    const env = await loaded()
    env.networkApi.failWith = new AppError('network', 'offline')
    await expect(env.refreshNetworks.execute()).rejects.toBeInstanceOf(AppError)
    expect(env.getNetworks.execute()).toMatchObject({ serverOnline: false, loaded: true })
    expect(env.getNetworks.execute().joined).toHaveLength(2)
  })
})
