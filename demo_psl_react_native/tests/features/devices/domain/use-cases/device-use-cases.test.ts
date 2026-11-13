import { makeEnv } from '@tests/helpers/make-env'

describe('GetAllDevicesUseCase', () => {
  it('returns the devices and lets callers subscribe to changes', () => {
    const env = makeEnv()
    const listener = jest.fn()
    env.getAllDevices.subscribe(listener)
    expect(Object.keys(env.getAllDevices.execute())).toHaveLength(6)
    env.toggleDevice.execute('d1')
    expect(listener).toHaveBeenCalled()
  })
})

describe('ToggleDeviceUseCase', () => {
  it('flips a device on and off', () => {
    const env = makeEnv()
    env.toggleDevice.execute('d1')
    expect(env.getAllDevices.execute().d1.on).toBe(true)
    env.toggleDevice.execute('d1')
    expect(env.getAllDevices.execute().d1.on).toBe(false)
  })

  it('does nothing for an unknown id', () => {
    const env = makeEnv()
    const before = env.getAllDevices.execute()
    env.toggleDevice.execute('nope')
    expect(env.getAllDevices.execute()).toBe(before)
  })
})

describe('SetDevicesPowerUseCase', () => {
  it('sets the power of the given devices only', () => {
    const env = makeEnv()
    env.setDevicesPower.execute(['d1', 'd2'], true)
    const devices = env.getAllDevices.execute()
    expect([devices.d1.on, devices.d2.on, devices.d3.on]).toEqual([true, true, false])
  })

  it('ignores ids that do not exist', () => {
    const env = makeEnv()
    env.setDevicesPower.execute(['ghost'], true)
    expect(env.getAllDevices.execute().ghost).toBeUndefined()
  })
})
