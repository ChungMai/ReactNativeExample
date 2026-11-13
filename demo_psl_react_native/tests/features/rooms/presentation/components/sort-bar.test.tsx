import { fireEvent, render, screen } from '@testing-library/react-native'
import { SortBar } from '@/features/rooms/presentation/components/sort-bar'

const setup = async (overrides = {}) => {
  const props = { sortKey: 'alphabetical' as const, dir: 'asc' as const, onChangeKey: jest.fn(), onToggleDir: jest.fn(), ...overrides }
  await render(<SortBar {...props} />)
  return props
}

describe('SortBar', () => {
  it('shows the current sort label and direction', async () => {
    await setup({ sortKey: 'recent', dir: 'desc' })
    expect(screen.getByText('Recently added')).toBeTruthy()
    expect(screen.getByLabelText('Sort descending')).toBeTruthy()
  })

  it('calls onToggleDir when the direction button is pressed', async () => {
    const props = await setup()
    await fireEvent.press(screen.getByLabelText('Sort ascending'))
    expect(props.onToggleDir).toHaveBeenCalledTimes(1)
  })

  it('opens the menu, picks a key and closes the menu', async () => {
    const props = await setup()
    expect(screen.getAllByText('Alphabetical')).toHaveLength(1)
    await fireEvent.press(screen.getByRole('button', { name: /Alphabetical/ }))
    expect(screen.getByText('Recently added')).toBeTruthy()
    await fireEvent.press(screen.getByText('Recently added'))
    expect(props.onChangeKey).toHaveBeenCalledWith('recent')
    expect(screen.queryByText('Recently added')).toBeNull() // menu closed again
  })
})
