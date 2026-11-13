import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import DevicesScreen from '@/features/devices/presentation/screens/devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

describe('DevicesScreen loading and error states', () => {
  it('shows a loading indicator, then the devices', async () => {
    const env = makeEnv()
    let finish!: () => void
    jest.spyOn(env.deviceRepository, 'refresh').mockReturnValue(new Promise<void>(r => { finish = r }))
    Object.assign(container, env)

    await render(<DevicesScreen />)
    expect(screen.getByRole('progressbar', { name: 'Loading devices' })).toBeTruthy()
    finish()
    await waitFor(() => expect(screen.getByText('Desk fan')).toBeTruthy())
  })

  it('shows the error and recovers with Retry', async () => {
    const env = makeEnv()
    jest.spyOn(env.deviceRepository, 'refresh').mockRejectedValueOnce(new AppError('timeout', 't'))
    Object.assign(container, env)

    await render(<DevicesScreen />)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The request took too long. Please try again.'))
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getByText('Desk fan')).toBeTruthy())
  })
})
