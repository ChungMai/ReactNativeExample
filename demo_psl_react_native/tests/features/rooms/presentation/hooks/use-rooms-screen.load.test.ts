import { act, renderHook, waitFor } from '@testing-library/react-native'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import { useRoomsScreen } from '@/features/rooms/presentation/hooks/use-rooms-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

describe('useRoomsScreen loading and error states', () => {
  it('goes from loading to success', async () => {
    Object.assign(container, makeEnv())
    const { result } = await renderHook(() => useRoomsScreen())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.errorMessage).toBeUndefined()
    expect(result.current.cards).toHaveLength(3)
  })

  it('reports a user-safe error message when loading fails', async () => {
    Object.assign(container, makeEnv({ apiError: new AppError('network', 'ECONNRESET') }))
    const { result } = await renderHook(() => useRoomsScreen())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorMessage).toBe('No connection. Check your network and try again.')
  })

  it('retry() recovers once the API works again', async () => {
    const env = makeEnv()
    jest.spyOn(env.roomRepository, 'refresh').mockRejectedValueOnce(new AppError('timeout', 't'))
    Object.assign(container, env)

    const { result } = await renderHook(() => useRoomsScreen())
    await waitFor(() => expect(result.current.status).toBe('error'))
    await act(async () => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('success'))
  })
})
