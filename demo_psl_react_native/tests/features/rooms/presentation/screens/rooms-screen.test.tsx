import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import RoomsScreen from '@/features/rooms/presentation/screens/rooms-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  // Stack.Screen renders the header button so screens can be tested end to end
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => options?.headerRight?.() ?? null },
  useLocalSearchParams: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('RoomsScreen', () => {
  it('renders the header, every room and its power badge', async () => {
    await render(<RoomsScreen />)
    expect(screen.getByText('Rooms')).toBeTruthy()
    for (const name of ['Room 11', 'Virtual Room', 'Bedroom']) expect(screen.getByText(name)).toBeTruthy()
    expect(screen.getByText('On')).toBeTruthy() // Bedroom
    expect(screen.getByText('Off')).toBeTruthy() // Virtual Room
  })

  it('opens a room and the new-room form', async () => {
    await render(<RoomsScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Virtual Room, off' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r2' } })
    await fireEvent.press(screen.getByRole('button', { name: 'Add room' }))
    expect(router.push).toHaveBeenCalledWith('/room/new')
  })

  it('searches rooms and shows an empty state when nothing matches', async () => {
    await render(<RoomsScreen />)
    expect(screen.queryByPlaceholderText('Search rooms')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Search rooms' }))

    await fireEvent.changeText(screen.getByPlaceholderText('Search rooms'), 'virt')
    expect(screen.getByText('Virtual Room')).toBeTruthy()
    expect(screen.queryByText('Bedroom')).toBeNull()

    await fireEvent.changeText(screen.getByPlaceholderText('Search rooms'), 'zzz')
    expect(screen.getByText('No rooms found')).toBeTruthy()
  })

  it('closing the search clears the filter', async () => {
    await render(<RoomsScreen />)
    const toggle = () => screen.getByRole('button', { name: 'Search rooms' })
    await fireEvent.press(toggle())
    await fireEvent.changeText(screen.getByPlaceholderText('Search rooms'), 'virt')
    await fireEvent.press(toggle())
    expect(screen.getByText('Bedroom')).toBeTruthy()
  })

  it('changes the sort direction and key', async () => {
    await render(<RoomsScreen />)
    await fireEvent.press(screen.getByLabelText('Sort ascending'))
    expect(screen.getByLabelText('Sort descending')).toBeTruthy()

    await fireEvent.press(screen.getByRole('button', { name: /Alphabetical/ }))
    await fireEvent.press(screen.getByText('Recently added'))
    expect(screen.getByRole('button', { name: /Recently added/ })).toBeTruthy()
  })
})
