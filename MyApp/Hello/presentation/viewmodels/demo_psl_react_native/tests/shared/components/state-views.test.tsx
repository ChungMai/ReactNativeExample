import { fireEvent, render, screen } from '@testing-library/react-native'
import { ErrorView, LoadingView } from '@/shared/components/state-views'

describe('LoadingView', () => {
  it('is announced as a progress indicator with a label', async () => {
    await render(<LoadingView label="Loading rooms" />)
    expect(screen.getByRole('progressbar', { name: 'Loading rooms' })).toBeTruthy()
  })
})

describe('ErrorView', () => {
  it('shows the message as an alert and retries on press', async () => {
    const onRetry = jest.fn()
    await render(<ErrorView message="No connection" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No connection')
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
