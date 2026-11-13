// Regressions for bugs that were found by running the app.
import { makeEnv } from '@tests/helpers/make-env'

describe('refresh() after local changes', () => {
  it('devices: loading the devices after a room was switched keeps the switch', async () => {
    const env = makeEnv()
    env.triggerRoom.execute('r2', true)
    await env.loadDevices.execute()
    expect(env.getAllDevices.execute().d1.on).toBe(true)
  })

  it('rooms: loading the rooms after a room was created keeps the new room', async () => {
    const env = makeEnv()
    env.createRoom.execute({ name: 'Kitchen', cover: 0, deviceIds: [] })
    await env.loadRooms.execute()
    expect(env.getAllRooms.execute().map(r => r.name)).toContain('Kitchen')
  })

  it('a forced reload (retry) keeps local changes too', async () => {
    const env = makeEnv()
    env.toggleDevice.execute('d4')
    await env.loadDevices.execute(true)
    expect(env.getAllDevices.execute().d4.on).toBe(true)
  })

  it('still loads normally when nothing was changed locally', async () => {
    const env = makeEnv()
    const refresh = jest.spyOn(env.deviceRepository, 'refresh')
    await env.loadDevices.execute()
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(Object.keys(env.getAllDevices.execute())).toHaveLength(6)
  })
})
