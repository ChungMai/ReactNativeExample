import { fireEvent, render, screen } from '@testing-library/react-native'
import GroupsScreen from '@/features/groups/presentation/desktop/screens/groups-screen'

describe('GroupsScreen (desktop)', () => {
  it('starts empty, adds a group and clears the field', async () => {
    await render(<GroupsScreen />)
    expect(screen.getByRole('heading', { name: 'Groups' })).toBeTruthy()
    expect(screen.getByText('No groups yet')).toBeTruthy()

    await fireEvent.changeText(screen.getByLabelText('Group name'), '  Kitchen  ')
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Kitchen')).toBeTruthy() // trimmed
    expect(screen.queryByText('No groups yet')).toBeNull()
    expect(screen.getByLabelText('Group name').props.value).toBe('')
  })

  it('does not add an empty name, and deletes a group', async () => {
    await render(<GroupsScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('No groups yet')).toBeTruthy()

    await fireEvent.changeText(screen.getByLabelText('Group name'), 'Garage')
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Delete Garage' }))
    expect(screen.queryByText('Garage')).toBeNull()
  })
})
