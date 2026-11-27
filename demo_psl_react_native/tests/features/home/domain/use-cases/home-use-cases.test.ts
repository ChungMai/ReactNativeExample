import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'

const on = (env: ReturnType<typeof makeEnv>, id: string) => env.getAllDevices.execute()[id].on

describe('ActivateHomeItemUseCase', () => {
  it('toggles a device', () => {
    const env = makeEnv()
    env.activateHomeItem.execute({ kind: 'device', id: 'd1' })
    expect(on(env, 'd1')).toBe(true)
  })

  it('switches a room off when something in it is on, and on otherwise', () => {
    const env = makeEnv()
    env.activateHomeItem.execute({ kind: 'room', id: 'r3' })
    expect(on(env, 'd6')).toBe(false)
    env.activateHomeItem.execute({ kind: 'room', id: 'r3' })
    expect(on(env, 'd6')).toBe(true)
  })

  it('switches a whole group', () => {
    const env = makeEnv()
    env.activateHomeItem.execute({ kind: 'group', id: 'g1' }) // d6 is on, so all go off
    expect([on(env, 'd1'), on(env, 'd2'), on(env, 'd6')]).toEqual([false, false, false])
    env.activateHomeItem.execute({ kind: 'group', id: 'g1' })
    expect([on(env, 'd1'), on(env, 'd2'), on(env, 'd6')]).toEqual([true, true, true])
  })

  it('applies the states of a scene', () => {
    const env = makeEnv()
    env.activateHomeItem.execute({ kind: 'scene', id: 's2' })
    expect([on(env, 'd1'), on(env, 'd2')]).toEqual([false, true])
  })

  it('refuses when the server is offline', async () => {
    const env = makeEnv()
    env.homeApi.failWith = new AppError('network', 'offline')
    await expect(env.refreshHome.execute()).rejects.toMatchObject({ code: 'network' })
    expect(() => env.activateHomeItem.execute({ kind: 'device', id: 'd1' })).toThrow(AppError)
    expect(on(env, 'd1')).toBe(false)
  })
})

describe('SaveFavouritesUseCase', () => {
  const selection = { device: ['d2'], room: ['r2'], group: [], zone: [], scene: [], preset: [] }

  it('saves ids and updates Room.favourite', () => {
    const env = makeEnv()
    env.saveFavourites.execute(selection)
    expect(env.getHome.execute().snapshot.favourites.device).toEqual(['d2'])
    expect(env.getAllRooms.execute().filter(r => r.favourite).map(r => r.id)).toEqual(['r2'])
  })

  it('keeps the saved favourites after a refresh', async () => {
    const env = makeEnv()
    env.saveFavourites.execute(selection)
    await env.refreshHome.execute()
    expect(env.getHome.execute().snapshot.favourites.device).toEqual(['d2'])
  })
})
