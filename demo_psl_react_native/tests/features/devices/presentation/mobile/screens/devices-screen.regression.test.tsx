// Regression: found by running the app on iOS.
// Switch a room on in the Rooms tab, then open the Devices tab for the first time: the tab is mounted
// lazily and its first load called `refresh()`, which replaced every device with the seed data.
// The room went back to "Off" and its devices showed as off.
import { render, screen, waitFor } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import DevicesScreen from '@/features/devices/presentation/mobile/screens/devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

describe('DevicesScreen: first load must not discard changes made earlier', () => {
  it("keeps the devices a room switched on before the tab was opened", async () => {
    Object.assign(container, makeEnv())
    container.triggerRoom.execute('r2', true) // "Virtual Room" -> d1, d2, d3 on

    await render(<DevicesScreen />)
    await waitFor(() => expect(screen.getAllByRole('switch')).toHaveLength(6)) // loading finished

    const switches = screen.getAllByRole('switch')
    expect([switches[0], switches[1], switches[2]].every(s => s.props.value === true)).toBe(true)
    expect(container.getAllDevices.execute().d1.on).toBe(true)
  })
})
