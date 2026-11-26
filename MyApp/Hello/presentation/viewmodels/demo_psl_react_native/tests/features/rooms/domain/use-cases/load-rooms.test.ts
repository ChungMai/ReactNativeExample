import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import { FakeRoomApi } from '@/features/rooms/data/sources/room-api'
import { LoadRoomsUseCase } from '@/features/rooms/domain/use-cases/load-rooms'

describe('LoadRoomsUseCase', () => {
  it('fetches once per session, then skips unless forced', async () => {
    const env = makeEnv()
    const refresh = jest.spyOn(env.roomRepository, 'refresh')
    await env.loadRooms.execute()
    await env.loadRooms.execute()
    expect(refresh).toHaveBeenCalledTimes(1)
    await env.loadRooms.execute(true)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('throws an AppError when the API fails, and tries again next time', async () => {
    const failing = makeEnv({ apiError: new AppError('network', 'down') })
    await expect(failing.loadRooms.execute()).rejects.toMatchObject({ code: 'network' })
    const refresh = jest.spyOn(failing.roomRepository, 'refresh')
    await expect(failing.loadRooms.execute()).rejects.toBeInstanceOf(AppError) // not marked as loaded
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('wraps a non-AppError failure', async () => {
    const repo = { refresh: jest.fn().mockRejectedValue(new Error('boom')) } as never
    await expect(new LoadRoomsUseCase(repo).execute()).rejects.toMatchObject({ code: 'unknown', message: 'boom' })
  })
})

describe('FakeRoomApi', () => {
  it('fails with the given error', async () => {
    await expect(new FakeRoomApi(new AppError('timeout', 't')).fetchRooms()).rejects.toMatchObject({ code: 'timeout' })
  })
})
