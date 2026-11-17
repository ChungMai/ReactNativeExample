import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import { useHomeScreen } from '@/features/home/presentation/shared/hooks/use-home-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('useHomeScreen', () => {
  it('shows only favourite rooms', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    expect(result.current.favourites.map(r => r.title)).toEqual(['Room 11'])
  })

  it('updates when a room is favourited or unfavourited', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    await act(async () => container.updateRoomAttributes.execute('r2', { favourite: true }))
    expect(result.current.favourites.map(r => r.title)).toEqual(['Room 11', 'Virtual Room'])
    await act(async () => container.updateRoomAttributes.execute('r1', { favourite: false }))
    expect(result.current.favourites.map(r => r.title)).toEqual(['Virtual Room'])
  })

  it('openRoom() navigates to the room', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    result.current.openRoom('r1')
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r1' } })
  })
})
