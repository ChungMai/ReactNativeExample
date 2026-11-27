import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import HomeScreen from '@/features/home/presentation/web/screens/home-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('HomeScreen (web)', () => {
  it('shows the network, the summary and the favourite sections', async () => {
    await render(<HomeScreen />)
    expect(screen.getByText('My Home')).toBeTruthy()
    expect(screen.getByText('Online')).toBeTruthy()
    expect(screen.getByText('1 Device')).toBeTruthy()
    expect(screen.getByText('Favourite Rooms')).toBeTruthy()
    expect(screen.getByText('Room 11')).toBeTruthy()
    expect(screen.queryByText('Bedroom')).toBeNull()
  })

  it('switches a device when its card is pressed', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Ceiling light, off' }))
    expect(screen.getByRole('button', { name: 'Ceiling light, on' })).toBeTruthy()
    expect(screen.getByText('2 Devices')).toBeTruthy()
  })

  it('updates live when a room becomes a favourite', async () => {
    await render(<HomeScreen />)
    await act(async () => container.updateRoomAttributes.execute('r3', { favourite: true }))
    expect(screen.getByText('Bedroom')).toBeTruthy()
  })

  it('opens the "+" menu and goes to New Room', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }))
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Create Room' }))
    expect(router.push).toHaveBeenCalledWith('/room/new')
    expect(screen.queryByRole('menuitem', { name: 'Create Room' })).toBeNull()
  })

  it('explains the server status', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Server Online' }))
    expect(screen.getByText('The server is online and connected.')).toBeTruthy()
  })

  it('opens the room page with the details button', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Open Room 11' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: 'r1' } })
  })
})
