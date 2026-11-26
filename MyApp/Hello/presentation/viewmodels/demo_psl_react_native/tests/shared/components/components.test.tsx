import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { IconButton } from '@/shared/components/icon-button'
import { Row } from '@/shared/components/row'
import { SegmentedControl } from '@/shared/components/segmented-control'

describe('IconButton', () => {
  it('is an accessible button that calls onPress', async () => {
    const onPress = jest.fn()
    await render(<IconButton icon="add" label="Add room" onPress={onPress} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Add room' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('Row', () => {
  it('renders the label and the control on the right', async () => {
    await render(<Row label="Switch On" right={<Text>control</Text>} />)
    expect(screen.getByText('Switch On')).toBeTruthy()
    expect(screen.getByText('control')).toBeTruthy()
  })
})

describe('SegmentedControl', () => {
  const options = ['Manage', 'Devices', 'Presets'] as const

  it('marks the current option as selected', async () => {
    await render(<SegmentedControl options={options} value="Devices" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Devices' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Manage' })).not.toBeSelected()
  })

  it('calls onChange with the pressed option', async () => {
    const onChange = jest.fn()
    await render(<SegmentedControl options={options} value="Manage" onChange={onChange} />)
    await fireEvent.press(screen.getByText('Presets'))
    expect(onChange).toHaveBeenCalledWith('Presets')
  })
})
