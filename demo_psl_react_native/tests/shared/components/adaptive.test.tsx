import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { adaptive } from '@/shared/components/adaptive'
import { useSizeClass } from '@/shared/hooks/use-size-class'

jest.mock('@/shared/hooks/use-size-class')

const Phone = ({ label }: { label: string }) => <Text>{`phone: ${label}`}</Text>
const Big = ({ label }: { label: string }) => <Text>{`big: ${label}`}</Text>
const Screen = adaptive(Phone, Big)

describe('adaptive', () => {
  it('renders the compact component in a compact window and passes the props on', async () => {
    jest.mocked(useSizeClass).mockReturnValue('compact')
    await render(<Screen label="hello" />)
    expect(screen.getByText('phone: hello')).toBeTruthy()
    expect(screen.queryByText(/big/)).toBeNull()
  })

  it('renders the regular component in a regular window', async () => {
    jest.mocked(useSizeClass).mockReturnValue('regular')
    await render(<Screen label="hello" />)
    expect(screen.getByText('big: hello')).toBeTruthy()
  })

  it('switches live when the window size class changes', async () => {
    jest.mocked(useSizeClass).mockReturnValue('compact')
    const view = await render(<Screen label="x" />)
    expect(screen.getByText('phone: x')).toBeTruthy()

    jest.mocked(useSizeClass).mockReturnValue('regular')
    await view.rerender(<Screen label="x" />)
    expect(screen.getByText('big: x')).toBeTruthy()
  })
})
