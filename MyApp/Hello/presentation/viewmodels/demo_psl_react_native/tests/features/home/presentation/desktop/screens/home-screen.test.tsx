import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import HomeScreen from '@/features/home/presentation/desktop/screens/home-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('HomeScreen (desktop)', () => {
  it('shows the favourite rooms under the page title', async () => {
    await render(<HomeScreen />)
    expect(screen.getByRole('heading', { name: 'Favourite rooms' })).toBeTruthy()
    expect(screen.getByText('Room 11')).toBeTruthy()
    expect(screen.queryByText('Bedroom')).toBeNull()
  })

  it('shows the empty state and updates live', async () => {
    container.updateRoomAttributes.execute('r1', { favourite: false })
    await render(<HomeScreen />)
    expect(screen.getByText('Tap ♡ on a room to add it here')).toBeTruthy()

    await act(async () => container.updateRoomAttributes.execute('r3', { favourite: true }))
    expect(screen.getByText('Bedroom')).toBeTruthy()
  })

  it('opens a room when its card is pressed', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Room 11' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r1' } })
  })
})
