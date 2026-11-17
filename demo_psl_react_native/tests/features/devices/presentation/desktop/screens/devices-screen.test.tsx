import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import DevicesScreen from '@/features/devices/presentation/desktop/screens/devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

beforeEach(() => { Object.assign(container, makeEnv()) })

describe('DevicesScreen (desktop)', () => {
  it('lists every device in one grouped list, each with a switch', async () => {
    await render(<DevicesScreen />)
    expect(screen.getByRole('heading', { name: 'Devices' })).toBeTruthy()
    for (const name of ['Ceiling light', 'Floor lamp', 'Smart plug', 'Desk fan', 'Window blind', 'Bedside light']) {
      expect(screen.getByText(name)).toBeTruthy()
    }
    expect(screen.getAllByRole('switch')).toHaveLength(6)
    expect(screen.getByLabelText('Power Bedside light')).toBeChecked() // starts on
  })

  it('flipping a switch updates the device', async () => {
    await render(<DevicesScreen />)
    expect(screen.getByLabelText('Power Ceiling light')).not.toBeChecked()
    await fireEvent(screen.getByLabelText('Power Ceiling light'), 'valueChange', true)
    expect(container.getAllDevices.execute().d1.on).toBe(true)
    expect(screen.getByLabelText('Power Ceiling light')).toBeChecked()
  })
})
