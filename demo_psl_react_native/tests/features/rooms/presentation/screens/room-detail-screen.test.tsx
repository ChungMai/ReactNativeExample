import { fireEvent, render, screen } from '@testing-library/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import RoomDetailScreen from '@/features/rooms/presentation/screens/room-detail-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  // Stack.Screen renders the header button so screens can be tested end to end
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => options?.headerRight?.() ?? null },
  useLocalSearchParams: jest.fn(),
}))

const open = (id: string) => jest.mocked(useLocalSearchParams).mockReturnValue({ id })

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('RoomDetailScreen', () => {
  it('shows a message for an unknown room', async () => {
    open('nope')
    await render(<RoomDetailScreen />)
    expect(screen.getByText('Room not found')).toBeTruthy()
  })

  it('shows the Manage tab by default', async () => {
    open('r2')
    await render(<RoomDetailScreen />)
    expect(screen.getByText('Control your room')).toBeTruthy()
    expect(screen.getByText('Switch Off')).toBeTruthy()
    expect(screen.getByText('Add to Favourites')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Manage' })).toBeSelected()
    expect(screen.getByRole('switch').props.disabled).toBeFalsy() // has devices, so it can be switched
  })

  it('the room switch turns every device on, and the label follows', async () => {
    open('r2')
    await render(<RoomDetailScreen />)
    await fireEvent(screen.getByRole('switch'), 'valueChange', true)
    expect(screen.getByText('Switch On')).toBeTruthy()
    expect(Object.values(container.getAllDevices.execute()).filter(d => d.on).map(d => d.id)).toEqual(['d1', 'd2', 'd3', 'd6'])
  })

  it('the room switch is disabled for a room without devices', async () => {
    open('r1')
    await render(<RoomDetailScreen />)
    expect(screen.getByText('Switch Off')).toBeTruthy()
    expect(screen.getByRole('switch').props.disabled).toBe(true)
  })

  it('toggles the favourite row', async () => {
    open('r2')
    await render(<RoomDetailScreen />)
    await fireEvent.press(screen.getByText('Add to Favourites'))
    expect(screen.getByText('Remove from Favourites')).toBeTruthy()
    expect(container.getAllRooms.execute()[1].favourite).toBe(true)
  })

  it('lists the room devices on the Devices tab and lets you switch one', async () => {
    open('r2')
    await render(<RoomDetailScreen />)
    await fireEvent.press(screen.getByRole('tab', { name: 'Devices' }))
    for (const name of ['Ceiling light', 'Floor lamp', 'Smart plug']) expect(screen.getByText(name)).toBeTruthy()
    expect(screen.queryByText('Desk fan')).toBeNull()

    await fireEvent(screen.getAllByRole('switch')[0], 'valueChange', true)
    expect(container.getAllDevices.execute().d1.on).toBe(true)
  })

  it('shows empty states for a room without devices and for presets', async () => {
    open('r1')
    await render(<RoomDetailScreen />)
    await fireEvent.press(screen.getByRole('tab', { name: 'Devices' }))
    expect(screen.getByText('No devices in this room yet')).toBeTruthy()
    await fireEvent.press(screen.getByRole('tab', { name: 'Presets' }))
    expect(screen.getByText('No presets yet')).toBeTruthy()
  })

  it('deletes the room from the options menu and goes back', async () => {
    open('r2')
    await render(<RoomDetailScreen />)
    expect(screen.queryByText('Delete room')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Room options' }))
    await fireEvent.press(screen.getByText('Delete room'))
    expect(container.getAllRooms.execute().map(r => r.id)).toEqual(['r1', 'r3'])
    expect(router.back).toHaveBeenCalledTimes(1)
  })
})
