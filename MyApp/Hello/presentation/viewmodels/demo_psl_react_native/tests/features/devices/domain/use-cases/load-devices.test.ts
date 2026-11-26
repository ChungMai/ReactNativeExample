import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import { FakeDeviceApi } from '@/features/devices/data/sources/device-api'

describe('LoadDevicesUseCase', () => {
  it('fetches once per session, then skips unless forced', async () => {
    const env = makeEnv()
    const refresh = jest.spyOn(env.deviceRepository, 'refresh')
    await env.loadDevices.execute()
    await env.loadDevices.execute()
    expect(refresh).toHaveBeenCalledTimes(1)
    await env.loadDevices.execute(true)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('throws an AppError when the API fails', async () => {
    const failing = makeEnv({ apiError: new AppError('network', 'down') })
    await expect(failing.loadDevices.execute()).rejects.toMatchObject({ code: 'network' })
  })
})

describe('FakeDeviceApi', () => {
  it('fails with the given error', async () => {
    await expect(new FakeDeviceApi(new AppError('timeout', 't')).fetchDevices()).rejects.toMatchObject({ code: 'timeout' })
  })
})
