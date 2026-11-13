import { act, renderHook, waitFor } from '@testing-library/react-native'
import { AppError } from '@/shared/domain/app-error'
import { useLoadOnMount } from '@/shared/hooks/use-load-on-mount'

const deferred = () => {
  let resolve!: () => void
  let reject!: (e: unknown) => void
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('useLoadOnMount', () => {
  it('is loading first, then success', async () => {
    const d = deferred()
    const load = jest.fn(() => d.promise)
    const { result } = await renderHook(() => useLoadOnMount(load))
    expect(result.current.status).toBe('loading')
    await act(async () => d.resolve())
    expect(result.current.status).toBe('success')
    expect(load).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledWith(false)
  })

  it('exposes a user-safe message on error, with the AppError', async () => {
    const load = jest.fn().mockRejectedValue(new AppError('network', 'ECONNRESET'))
    const { result } = await renderHook(() => useLoadOnMount(load))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current).toMatchObject({ status: 'error', message: 'No connection. Check your network and try again.' })
    expect((result.current as { error: AppError }).error.code).toBe('network')
  })

  it('wraps a non-AppError rejection as an unknown error', async () => {
    const load = jest.fn().mockRejectedValue('weird')
    const { result } = await renderHook(() => useLoadOnMount(load))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect((result.current as { error: AppError }).error.code).toBe('unknown')
  })

  it('retry() loads again with force=true and can recover', async () => {
    const load = jest.fn().mockRejectedValueOnce(new AppError('timeout', 't')).mockResolvedValue(undefined)
    const { result } = await renderHook(() => useLoadOnMount(load))
    await waitFor(() => expect(result.current.status).toBe('error'))

    await act(async () => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(load).toHaveBeenNthCalledWith(1, false)
    expect(load).toHaveBeenNthCalledWith(2, true)
  })

  it('does not update state after unmount (effect cleanup)', async () => {
    const d = deferred()
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    const load = () => d.promise // stable reference, as the hook requires
    const { unmount } = await renderHook(() => useLoadOnMount(load))
    await unmount()
    await act(async () => d.resolve())
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
  })

  it('ignores the result of an attempt that was replaced by a retry (stale result)', async () => {
    const first = deferred()
    const second = deferred()
    const load = jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { result } = await renderHook(() => useLoadOnMount(load))

    await act(async () => result.current.retry()) // second attempt starts while the first is pending
    await act(async () => first.reject(new AppError('network', 'late failure'))) // stale -> ignored
    expect(result.current.status).toBe('loading')

    await act(async () => second.resolve())
    expect(result.current.status).toBe('success')
  })
})
