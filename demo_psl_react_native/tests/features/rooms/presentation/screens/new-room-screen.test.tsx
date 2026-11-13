import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import NewRoomScreen from '@/features/rooms/presentation/screens/new-room-screen'

jest.mock('@/di/container', () => ({ container: {} }))
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

describe('NewRoomScreen', () => {
  it('cannot save until a name is entered', async () => {
    await render(<NewRoomScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(container.getAllRooms.execute()).toHaveLength(3)
    expect(router.back).not.toHaveBeenCalled()
  })

  it('saves a new room with the entered name and goes back', async () => {
    await render(<NewRoomScreen />)
    await fireEvent.changeText(screen.getByPlaceholderText('Room Name'), 'Kitchen')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(container.getAllRooms.execute().at(-1)?.name).toBe('Kitchen')
    expect(router.back).toHaveBeenCalledTimes(1)
  })

  it('the camera button cycles the cover', async () => {
    await render(<NewRoomScreen />)
    expect(screen.getByText(/cover 1\/6/)).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Change cover image'))
    expect(screen.getByText(/cover 2\/6/)).toBeTruthy()
  })

  it('picks devices from the picker and saves them with the room', async () => {
    await render(<NewRoomScreen />)
    expect(screen.queryByText('Desk fan')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: /Add Device/ }))
    await fireEvent.press(screen.getByText('Desk fan'))
    expect(screen.getAllByText('Desk fan')).toHaveLength(2) // picker row + selected tile

    await fireEvent.changeText(screen.getByPlaceholderText('Room Name'), 'Study')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(container.getAllRooms.execute().at(-1)).toMatchObject({ name: 'Study', deviceIds: ['d4'] })
  })

  it('pressing a selected device removes it again', async () => {
    await render(<NewRoomScreen />)
    await fireEvent.press(screen.getByRole('button', { name: /Add Device/ }))
    await fireEvent.press(screen.getByText('Desk fan'))
    await fireEvent.press(screen.getAllByText('Desk fan')[0])
    expect(screen.getAllByText('Desk fan')).toHaveLength(1) // only the picker row is left
  })
})
