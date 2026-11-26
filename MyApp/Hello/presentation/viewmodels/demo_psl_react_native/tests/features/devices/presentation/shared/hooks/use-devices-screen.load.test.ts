import { act, renderHook, waitFor } from '@testing-library/react-native'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import { useDevicesScreen } from '@/features/devices/presentation/shared/hooks/use-devices-screen'

jest.mock('@/di/container', () => ({ container: {} }))

describe('useDevicesScreen loading and error states', () => {
  it('goes from loading to success', async () => {
    Object.assign(container, makeEnv())
    const { result } = await renderHook(() => useDevicesScreen())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.devices).toHaveLength(6)
  })

  it('reports an error, then recovers on retry()', async () => {
    const env = makeEnv()
    jest.spyOn(env.deviceRepository, 'refresh').mockRejectedValueOnce(new AppError('network', 'down'))
    Object.assign(container, env)

    const { result } = await renderHook(() => useDevicesScreen())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorMessage).toBe('No connection. Check your network and try again.')
    await act(async () => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('success'))
  })
})
