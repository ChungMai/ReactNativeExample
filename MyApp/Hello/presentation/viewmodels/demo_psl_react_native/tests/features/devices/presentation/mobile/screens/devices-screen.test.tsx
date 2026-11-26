import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import DevicesScreen from '@/features/devices/presentation/mobile/screens/devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

beforeEach(() => { Object.assign(container, makeEnv()) })

describe('DevicesScreen', () => {
  it('lists every device with a switch', async () => {
    await render(<DevicesScreen />)
    for (const name of ['Ceiling light', 'Floor lamp', 'Smart plug', 'Desk fan', 'Window blind', 'Bedside light']) {
      expect(screen.getByText(name)).toBeTruthy()
    }
    expect(screen.getAllByRole('switch')).toHaveLength(6)
  })

  it('reflects the initial state and updates the device when a switch is flipped', async () => {
    await render(<DevicesScreen />)
    const switches = screen.getAllByRole('switch')
    expect(switches[5]).toBeChecked() // Bedside light starts on
    expect(switches[0]).not.toBeChecked()

    await fireEvent(switches[0], 'valueChange', true)
    expect(container.getAllDevices.execute().d1.on).toBe(true)
    expect(screen.getAllByRole('switch')[0]).toBeChecked()
  })
})
