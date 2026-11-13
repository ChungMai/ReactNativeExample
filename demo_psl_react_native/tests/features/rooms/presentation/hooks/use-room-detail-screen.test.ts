import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import { useRoomDetailScreen } from '@/features/rooms/presentation/hooks/use-room-detail-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('useRoomDetailScreen', () => {
  it('builds the display model of a room', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r2'))
    expect(result.current.detail).toMatchObject({
      id: 'r2', title: 'Virtual Room', isOn: false, canSwitch: true,
      switchLabel: 'Switch Off', isFavourite: false, favouriteLabel: 'Add to Favourites',
    })
    expect(result.current.detail?.devices.map(d => d.title)).toEqual(['Ceiling light', 'Floor lamp', 'Smart plug'])
  })

  it('returns no detail for an unknown or missing id, and actions do nothing', async () => {
    for (const id of ['nope', undefined]) {
      const { result } = await renderHook(() => useRoomDetailScreen(id))
      expect(result.current.detail).toBeUndefined()
      await act(async () => { result.current.setPower(true); result.current.toggleFavourite(); result.current.deleteRoom() })
    }
    expect(router.back).not.toHaveBeenCalled()
    expect(container.getAllRooms.execute()).toHaveLength(3)
  })

  it('setPower() switches every device of the room', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r2'))
    await act(async () => result.current.setPower(true))
    expect(result.current.detail).toMatchObject({ isOn: true, switchLabel: 'Switch On' })
    expect(result.current.detail?.devices.every(d => d.isOn)).toBe(true)
  })

  it('toggleDevice() changes one device and the derived room power', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r2'))
    await act(async () => result.current.toggleDevice('d1'))
    expect(result.current.detail?.isOn).toBe(true)
    expect(result.current.detail?.devices.map(d => d.isOn)).toEqual([true, false, false])
  })

  it('toggleFavourite() flips the favourite flag and label', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r2'))
    await act(async () => result.current.toggleFavourite())
    expect(result.current.detail).toMatchObject({ isFavourite: true, favouriteLabel: 'Remove from Favourites' })
  })

  it('a room without devices cannot be switched', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r1'))
    expect(result.current.detail).toMatchObject({ canSwitch: false, isOn: false })
  })

  it('deleteRoom() removes the room and goes back', async () => {
    const { result } = await renderHook(() => useRoomDetailScreen('r2'))
    await act(async () => result.current.deleteRoom())
    expect(router.back).toHaveBeenCalledTimes(1)
    expect(container.getAllRooms.execute().map(r => r.id)).toEqual(['r1', 'r3'])
    expect(result.current.detail).toBeUndefined()
  })
})
