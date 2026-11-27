// The room detail screen shows the server's data and cannot change it.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { ServerRoomList } from '@/features/rooms/data/server-room-list'
import RoomDetailScreen from '@/features/rooms/presentation/shared/screens/room-detail-screen'
import { makeEnv } from '@tests/helpers/make-env'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => options?.headerRight?.() ?? null },
  useLocalSearchParams: () => ({ id: '2' }),
}))

beforeEach(() => {
  const serverRooms = new ServerRoomList({
    source: () => 'real',
    fetchRooms: async () => [{ id: '2', name: 'Room 11', isOn: true }],
    fetchMembers: async () => ({
      devices: [{ id: '5', name: 'Lamp', kind: 'light', isOn: true, unreachable: false }],
      presets: [{ id: '7', name: 'Evening' }],
    }),
  })
  Object.assign(container, makeEnv(), { serverRooms })
})

it('shows the three tabs, and nothing can be changed', async () => {
  await render(<RoomDetailScreen />)

  expect(await screen.findByText('Control your room')).toBeTruthy()
  expect(screen.getByText('Switch On')).toBeTruthy()
  expect(screen.getByRole('switch').props.disabled).toBe(true)

  await fireEvent.press(screen.getByRole('tab', { name: 'Devices' }))
  expect(screen.getByText('Lamp')).toBeTruthy()
  expect(screen.getByRole('switch').props.disabled).toBe(true)

  await fireEvent.press(screen.getByRole('tab', { name: 'Presets' }))
  expect(screen.getByText('Evening')).toBeTruthy()
})
