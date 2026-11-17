// The desktop UI (iPad, Mac) is different (search always visible, round "+" button, grid next to the sidebar),
// but it runs on the same view model, so the behaviour is the same as on mobile and web.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import RoomsScreen from '@/features/rooms/presentation/desktop/screens/rooms-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('RoomsScreen (desktop)', () => {
  it('shows the page title, every room and its power badge', async () => {
    await render(<RoomsScreen />)
    expect(screen.getByRole('heading', { name: 'Rooms' })).toBeTruthy()
    for (const name of ['Room 11', 'Virtual Room', 'Bedroom']) expect(screen.getByText(name)).toBeTruthy()
    expect(screen.getByText('On')).toBeTruthy()
    expect(screen.getByText('Off')).toBeTruthy()
  })

  it('has the search box visible from the start and filters as you type', async () => {
    await render(<RoomsScreen />)
    await fireEvent.changeText(screen.getByLabelText('Search rooms'), 'virt')
    expect(screen.getByText('Virtual Room')).toBeTruthy()
    expect(screen.queryByText('Bedroom')).toBeNull()

    await fireEvent.changeText(screen.getByLabelText('Search rooms'), 'zzz')
    expect(screen.getByText('No rooms found')).toBeTruthy()
  })

  it('opens a room and the new-room form', async () => {
    await render(<RoomsScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Virtual Room, off' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r2' } })
    await fireEvent.press(screen.getByRole('button', { name: 'Add room' }))
    expect(router.push).toHaveBeenCalledWith('/room/new')
  })
})
