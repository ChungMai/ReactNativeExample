import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import DevicesScreen from '@/features/devices/presentation/web/screens/devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

beforeEach(() => { Object.assign(container, makeEnv()) })

describe('DevicesScreen (web)', () => {
  it('lists every device as a table row with its status and a switch', async () => {
    await render(<DevicesScreen />)
    expect(screen.getByRole('heading', { name: 'Devices' })).toBeTruthy()
    for (const name of ['Ceiling light', 'Floor lamp', 'Smart plug', 'Desk fan', 'Window blind', 'Bedside light']) {
      expect(screen.getByText(name)).toBeTruthy()
    }
    expect(screen.getAllByRole('switch')).toHaveLength(6)
    expect(screen.getAllByText('On')).toHaveLength(1) // Bedside light starts on
  })

  it('flipping a switch updates the device and its status text', async () => {
    await render(<DevicesScreen />)
    await fireEvent(screen.getByLabelText('Power Ceiling light'), 'valueChange', true)
    expect(container.getAllDevices.execute().d1.on).toBe(true)
    expect(screen.getAllByText('On')).toHaveLength(2)
  })
})
