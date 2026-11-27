// View model of the network list. Swift: PSLNetworkListViewModel and the controller's alerts.
import { useFocusEffect } from 'expo-router'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { NetworkError } from '../../../domain/network-error'

export const POLL_INTERVAL_MS = 15_000

export interface Dialog {
  title: string
  message: string
}

const SERVER_UNREACHABLE: Dialog = {
  title: 'Server unreachable',
  message: 'The server may not exist or it is unavailable at this time. Please check the server / network connection, and try again.',
}

export function useNetworkListScreen() {
  const { getNetworks, refreshNetworks, selectNetwork, logout } = container
  const list = useSyncExternalStore(getNetworks.subscribe, getNetworks.execute)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load on arrival and poll while visible. A failure shows up as "Offline" with the cached list.
  useFocusEffect(
    useCallback(() => {
      const poll = () => {
        refreshNetworks.execute().then(
          () => setLoadError(null),
          e => setLoadError(toAppError(e).message),
        )
      }
      poll()
      const timer = setInterval(poll, POLL_INTERVAL_MS)
      return () => clearInterval(timer)
    }, [refreshNetworks]),
  )

  const select = (id: string) => {
    try {
      selectNetwork.execute(id)
    } catch (e) {
      setDialog(e instanceof NetworkError
        ? { title: 'Permission Denied', message: 'Remote access is not available. Please contact the administrator for more details.' }
        : { title: 'Error', message: userMessage(toAppError(e)) })
    }
  }

  return {
    loading: !list.loaded,
    serverOnline: list.serverOnline,
    // technical text, for development builds only
    loadError: __DEV__ ? loadError : null,
    joined: list.joined.map(network => ({ id: network.id, name: network.name, onPress: () => select(network.id) })),
    empty: list.loaded && list.joined.length === 0,
    dialog,
    closeDialog: () => setDialog(null),
    showServerStatus: () =>
      setDialog(list.serverOnline ? { title: 'Server', message: 'The server is online and connected.' } : SERVER_UNREACHABLE),
    logout: () => logout.execute(),
  }
}
