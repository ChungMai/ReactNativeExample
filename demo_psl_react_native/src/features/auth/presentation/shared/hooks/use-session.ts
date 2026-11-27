import { useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'

/** The current session, or undefined when signed out. */
export function useSession() {
  const { getSession } = container
  return useSyncExternalStore(getSession.subscribe, getSession.execute, getSession.execute)
}
