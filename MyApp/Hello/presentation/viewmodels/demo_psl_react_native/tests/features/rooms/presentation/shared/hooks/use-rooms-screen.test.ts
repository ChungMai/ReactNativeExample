import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import { useRoomsScreen } from '@/features/rooms/presentation/shared/hooks/use-rooms-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

const titles = (cards: { title: string }[]) => cards.map(c => c.title)

describe('useRoomsScreen', () => {
  it('starts sorted alphabetically with power badges derived from devices', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    expect(titles(result.current.cards)).toEqual(['Bedroom', 'Room 11', 'Virtual Room'])
    expect(result.current.cards.map(c => c.powerBadge)).toEqual(['On', null, 'Off'])
    expect(result.current).toMatchObject({ searching: false, query: '', sortKey: 'alphabetical', dir: 'asc' })
  })

  it('filters by the search query', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    await act(async () => result.current.setQuery('virt'))
    expect(titles(result.current.cards)).toEqual(['Virtual Room'])
    await act(async () => result.current.setQuery('zzz'))
    expect(result.current.cards).toEqual([])
  })

  it('toggleSearch() opens search and clears the query', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    await act(async () => result.current.toggleSearch())
    expect(result.current.searching).toBe(true)
    await act(async () => result.current.setQuery('bed'))
    await act(async () => result.current.toggleSearch())
    expect(result.current).toMatchObject({ searching: false, query: '' })
    expect(result.current.cards).toHaveLength(3)
  })

  it('toggleDir() reverses the order and setSortKey() changes it', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    await act(async () => result.current.toggleDir())
    expect(titles(result.current.cards)).toEqual(['Virtual Room', 'Room 11', 'Bedroom'])
    await act(async () => result.current.toggleDir())
    await act(async () => result.current.setSortKey('recent'))
    expect(titles(result.current.cards)).toEqual(['Bedroom', 'Virtual Room', 'Room 11']) // newest first
  })

  it('reacts to changes made elsewhere (a device switched on)', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    await act(async () => container.toggleDevice.execute('d1'))
    expect(result.current.cards.find(c => c.id === 'r2')?.powerBadge).toBe('On')
  })

  it('navigates to a room and to the new-room form', async () => {
    const { result } = await renderHook(() => useRoomsScreen())
    result.current.openRoom('r2')
    result.current.openNewRoom()
    expect(router.push).toHaveBeenNthCalledWith(1, { pathname: '/room/[id]', params: { id: 'r2' } })
    expect(router.push).toHaveBeenNthCalledWith(2, '/room/new')
  })
})
