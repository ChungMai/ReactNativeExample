import { useEffect, useState } from 'react'
import { AppError, toAppError, userMessage } from '../domain/app-error'

export type LoadState =
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: AppError; message: string }

/**
 * Runs `load` when the screen mounts and exposes loading / success / error + retry.
 * `load` must be a stable function (e.g. a use case's `execute`), otherwise it runs on every render.
 */
export function useLoadOnMount(load: (force: boolean) => Promise<void>) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    load(attempt > 0).then(
      () => { if (!cancelled) setState({ status: 'success' }) },
      e => {
        if (cancelled) return
        const error = toAppError(e)
        setState({ status: 'error', error, message: userMessage(error) })
      },
    )
    // Cleanup: a result that arrives after unmount (or after a retry) must not touch state.
    return () => { cancelled = true }
  }, [load, attempt])

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt(a => a + 1)
  }

  return { ...state, retry }
}
