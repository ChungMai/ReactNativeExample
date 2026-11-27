import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import { POLL_INTERVAL_MS, useHomeScreen } from '@/features/home/presentation/shared/hooks/use-home-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

let env: ReturnType<typeof makeEnv>
beforeEach(() => {
  jest.clearAllMocks()
  env = makeEnv()
  Object.assign(container, env)
})
afterEach(() => jest.useRealTimers())

const rooms = (result: { current: ReturnType<typeof useHomeScreen> }) =>
  result.current.sections.find(s => s.kind === 'room')?.cards.map(c => c.title)

describe('useHomeScreen', () => {
  it('shows favourite rooms and follows changes', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    expect(rooms(result)).toEqual(['Room 11'])
    await act(async () => container.updateRoomAttributes.execute('r2', { favourite: true }))
    expect(rooms(result)).toEqual(['Room 11', 'Virtual Room'])
  })

  it('polls while mounted and stops afterwards', async () => {
    jest.useFakeTimers()
    const refresh = jest.spyOn(env.refreshHome, 'execute')
    const { unmount } = await renderHook(() => useHomeScreen())
    await act(async () => jest.advanceTimersByTime(POLL_INTERVAL_MS * 2))
    expect(refresh).toHaveBeenCalledTimes(3)
    await unmount()
    await act(async () => jest.advanceTimersByTime(POLL_INTERVAL_MS))
    expect(refresh).toHaveBeenCalledTimes(3)
  })

  it('goes offline: disables adding and explains why a card cannot be switched', async () => {
    env.homeApi.failWith = new AppError('network', 'offline')
    const { result } = await renderHook(() => useHomeScreen())
    expect(result.current.serverOnline).toBe(false)
    await act(async () => result.current.toggleMenu('add'))
    expect(result.current.menuActions.find(a => a.label === 'Add Favourite')?.disabled).toBe(true)
    await act(async () => result.current.activate(result.current.sections[1].cards[0]))
    expect(result.current.notice).toMatch(/No connection/)
  })

  it('offers "Add Favourite" when there are none', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    expect(result.current.emptyTile).toBeNull()
    await act(async () =>
      container.saveFavourites.execute({ device: [], room: [], group: [], zone: [], scene: [], preset: [] }))
    expect(result.current.emptyTile?.title).toBe('Add Favourite')
    result.current.emptyTile?.onPress()
    expect(router.push).toHaveBeenCalledWith('/favourites/add')
  })

  it('shows the chosen network and goes back to the list from its name', async () => {
    await env.refreshNetworks.execute()
    await env.selectNetwork.execute('n2')
    const { result } = await renderHook(() => useHomeScreen())
    expect(result.current).toMatchObject({ networkName: 'Beach House', accessLabel: 'Remote', canAdd: false })
    await act(async () => result.current.openNetworks())
    expect(env.getNetworks.active()).toBeUndefined()
  })

  it('opens the detail page of a room', async () => {
    const { result } = await renderHook(() => useHomeScreen())
    const card = result.current.sections.find(s => s.kind === 'room')!.cards[0]
    await act(async () => result.current.openDetail(card))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r1' } })
  })
})
