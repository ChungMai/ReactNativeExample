import { fireEvent, render, screen } from '@testing-library/react-native'
import type { RoomDisplay } from '@/features/rooms/presentation/shared/models/room-display'
import { RoomCard } from '@/features/rooms/presentation/mobile/components/room-card'

const room: RoomDisplay = {
  id: 'r1', title: 'Bedroom', coverSource: { uri: 'x' }, powerBadge: 'On', accessibilityLabel: 'Bedroom, on',
}

describe('RoomCard', () => {
  it('shows the title and the power badge', async () => {
    await render(<RoomCard room={room} onPress={() => {}} />)
    expect(screen.getByText('Bedroom')).toBeTruthy()
    expect(screen.getByText('On')).toBeTruthy()
  })

  it('hides the badge for a room without devices', async () => {
    await render(<RoomCard room={{ ...room, powerBadge: null, accessibilityLabel: 'Bedroom' }} onPress={() => {}} />)
    expect(screen.queryByText('On')).toBeNull()
    expect(screen.queryByText('Off')).toBeNull()
  })

  it('is accessible and calls onPress', async () => {
    const onPress = jest.fn()
    await render(<RoomCard room={room} onPress={onPress} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Bedroom, on' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
