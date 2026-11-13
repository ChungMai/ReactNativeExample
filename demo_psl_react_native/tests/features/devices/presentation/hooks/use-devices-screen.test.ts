import { act, renderHook } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import { useDevicesScreen } from '@/features/devices/presentation/hooks/use-devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

beforeEach(() => { Object.assign(container, makeEnv()) })

describe('useDevicesScreen', () => {
  it('lists every device as a display model', async () => {
    const { result } = await renderHook(() => useDevicesScreen())
    expect(result.current.devices).toHaveLength(6)
    expect(result.current.devices[0]).toEqual({ id: 'd1', title: 'Ceiling light', isOn: false })
  })

  it('toggle() flips a device and the hook re-renders with the new state', async () => {
    const { result } = await renderHook(() => useDevicesScreen())
    await act(async () => result.current.toggle('d1'))
    expect(result.current.devices.find(d => d.id === 'd1')?.isOn).toBe(true)
    await act(async () => result.current.toggle('d1'))
    expect(result.current.devices.find(d => d.id === 'd1')?.isOn).toBe(false)
  })
})
