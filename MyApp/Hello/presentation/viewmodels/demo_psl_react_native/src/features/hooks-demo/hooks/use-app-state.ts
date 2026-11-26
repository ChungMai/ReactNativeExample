import { useEffect, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

/** 'active' | 'background' | 'inactive' – updates when the user leaves or returns to the app. */
export function useAppState(): AppStateStatus {
  const [status, setStatus] = useState<AppStateStatus>(AppState.currentState as AppStateStatus)

  useEffect(() => {
    const sub = AppState.addEventListener('change', setStatus)
    return () => sub.remove()
  }, [])

  return status
}
