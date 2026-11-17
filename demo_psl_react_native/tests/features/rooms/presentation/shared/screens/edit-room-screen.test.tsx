import { fireEvent, render, screen } from '@testing-library/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import EditRoomScreen from '@/features/rooms/presentation/shared/screens/edit-room-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => options?.headerRight?.() ?? null },
  useLocalSearchParams: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
  ;(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'r2' })
})

describe('EditRoomScreen', () => {
  it('is pre-filled with the room name', async () => {
    await render(<EditRoomScreen />)
    expect(screen.getByPlaceholderText('Room Name').props.value).toBe('Virtual Room')
  })

  it('saves a new name, cover and device list, then goes back', async () => {
    const before = container.getRoomDetailInfo.execute('r2')!.cover
    await render(<EditRoomScreen />)
    await fireEvent.changeText(screen.getByPlaceholderText('Room Name'), '  Studio ')
    await fireEvent.press(screen.getByLabelText('Change cover image'))
    await fireEvent.press(screen.getByText('Add Device'))
    await fireEvent.press(screen.getByText('Desk fan'))
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    const room = container.getRoomDetailInfo.execute('r2')!
    expect(room.name).toBe('Studio')
    expect(room.cover).toBe((before + 1) % 6)
    expect(room.deviceIds).toContain('d4')
    expect(router.back).toHaveBeenCalledTimes(1)
  })

  it('cannot save a blank name', async () => {
    await render(<EditRoomScreen />)
    await fireEvent.changeText(screen.getByPlaceholderText('Room Name'), '   ')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(container.getRoomDetailInfo.execute('r2')?.name).toBe('Virtual Room')
    expect(router.back).not.toHaveBeenCalled()
  })

  it('shows a message for an unknown room', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'nope' })
    await render(<EditRoomScreen />)
    expect(screen.getByText('Room not found')).toBeTruthy()
  })
})
