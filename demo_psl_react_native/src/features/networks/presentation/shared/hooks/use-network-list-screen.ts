// View model of the network list. Swift: PSLNetworkListViewModel and the controller's alerts.
import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import type { AccessMode, JoinedNetwork, NearbyNetwork } from '../../../domain/entities/network'
import { NetworkError, type NetworkErrorCode } from '../../../domain/network-error'
import { availableActions, isActionEnabled, type NetworkAction } from '../../../domain/network-rules'

export const POLL_INTERVAL_MS = 15_000

const MODE_LABELS: Record<AccessMode, string> = {
  local: 'Local Access',
  remote: 'Remote Access',
  troubleshoot: 'Troubleshoot',
  unknown: 'Checking...',
}

export interface DialogButton {
  label: string
  destructive?: boolean
  onPress: () => void
}
export interface Dialog {
  title: string
  message: string
  /** Set when the user has to type something (delete confirmation). */
  inputLabel?: string
  buttons: DialogButton[]
}

function explain(code: NetworkErrorCode, name: string): [title: string, message: string] {
  switch (code) {
    case 'offline':
      return ['Server unreachable', 'The server may not exist or it is unavailable at this time. Please check the server / network connection, and try again.']
    case 'unreachable':
      return ['Error', `Failed to connect to your network '${name}'. Please check that the hub is connected correctly.`]
    case 'remoteAccessDenied':
      return ['Permission Denied', 'Remote access is not available. Please contact the administrator for more details.']
    case 'otherServer':
      return ['', `"${name}" isn’t on your current server. Change the server if you want to connect.`]
    case 'requestPending':
      return ['', 'This request is already in progress.']
    case 'accessUnavailable':
      return ['Access Unavailable', 'You are not within the local access of this network to perform this action.']
    case 'nameMismatch':
      return ['Error', 'Invalid name entered. Delete is not successful.']
  }
}

export function useNetworkListScreen() {
  const { getNetworks, refreshNetworks, selectNetwork, joinNetwork, removeNetwork, logout } = container
  const list = useSyncExternalStore(getNetworks.subscribe, getNetworks.execute)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const working = useRef(false) // state updates too late to stop a second tap
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

  const close = () => setDialog(null)
  const ok: DialogButton = { label: 'OK', onPress: close }
  const tell = (title: string, message: string) => setDialog({ title, message, buttons: [ok] })
  const cancel: DialogButton = { label: 'Cancel', onPress: close }

  /** Runs one action at a time and explains why it failed. */
  const run = async (name: string, action: () => Promise<void> | void, retry?: () => void) => {
    if (working.current) return
    working.current = true
    setBusy(true)
    setDialog(null)
    try {
      await action()
    } catch (e) {
      if (!(e instanceof NetworkError)) return tell('Error', userMessage(toAppError(e)))
      const [title, message] = explain(e.code, name)
      if (e.code === 'unreachable' && retry) {
        setDialog({ title, message, buttons: [{ label: 'Try again', onPress: retry }, cancel] })
      } else {
        tell(title, message)
      }
    } finally {
      working.current = false
      setBusy(false)
    }
  }

  const select = (network: JoinedNetwork): void => {
    void run(network.name, () => selectNetwork.execute(network.id), () => select(network))
  }

  const join = (network: NearbyNetwork) =>
    run(network.name, () => {
      joinNetwork.check(network.id)
      setDialog({
        title: 'Confirm',
        message: `Send a request to join "${network.name}"?`,
        buttons: [
          cancel,
          {
            label: 'Send',
            onPress: () => void run(network.name, async () => {
              await joinNetwork.execute(network.id)
              tell('', 'Request has been sent to join network. Please check profile for status.')
            }),
          },
        ],
      })
    })

  const exit = (network: JoinedNetwork) =>
    run(network.name, () => {
      removeNetwork.check(network.id, 'exit')
      setDialog({
        title: 'Are you sure you want to leave this network?',
        message: 'This action can’t be undone. You will lose all favourite objects, customisations and access to this network.',
        buttons: [{ label: 'OK', destructive: true, onPress: () => void run(network.name, () => removeNetwork.exit(network.id)) }, cancel],
      })
    })

  const remove = (network: JoinedNetwork) =>
    run(network.name, () => {
      removeNetwork.check(network.id, 'delete')
      setDialog({
        title: 'Warning',
        message: 'This action can’t be undone. When you delete this network, you will lose connected devices, automations, backups and users. Do not proceed if you are not sure.',
        buttons: [cancel, { label: 'Proceed', destructive: true, onPress: () => askName(network) }],
      })
    })

  // The typed name is read from a ref: the dialog's buttons are created before the user types.
  const typed = useRef('')
  const type = (text: string) => {
    typed.current = text
    setInput(text)
  }
  const askName = (network: JoinedNetwork) => {
    type('')
    setDialog({
      title: 'Confirm delete',
      message: `You are about to delete ${network.name}. Enter name of the network below`,
      inputLabel: 'Network name',
      buttons: [
        cancel,
        { label: 'Delete', destructive: true, onPress: () => void run(network.name, () => removeNetwork.delete(network.id, typed.current)) },
      ],
    })
  }

  return {
    loading: !list.loaded,
    busy,
    serverOnline: list.serverOnline,
    readOnly: list.readOnly,
    // technical text, for development builds only
    loadError: __DEV__ ? loadError : null,
    joined: list.joined.map(network => ({
      id: network.id,
      name: network.name,
      modeLabel: MODE_LABELS[network.mode],
      troubleshoot: network.mode === 'troubleshoot',
      expanded: expanded === network.id,
      actions: (list.readOnly ? [] : availableActions(network)).map((action: NetworkAction) => ({
        label: action === 'delete' ? `Delete ${network.name}` : `Leave ${network.name}`,
        title: action === 'delete' ? 'Delete' : 'Leave',
        enabled: isActionEnabled(action, network, list.serverOnline),
        onPress: () => void (action === 'delete' ? remove(network) : exit(network)),
      })),
      onPress: () => select(network),
      onToggleActions: () => setExpanded(open => (open === network.id ? null : network.id)),
    })),
    nearby: list.nearby.map(network => ({
      id: network.id,
      name: network.name,
      statusLabel: network.requestPending ? 'PENDING' : 'JOIN',
      dimmed: !list.serverOnline || !network.onCurrentServer,
      onPress: () => void join(network),
    })),
    empty: list.loaded && list.joined.length === 0 && list.nearby.length === 0,
    dialog,
    input,
    type,
    closeDialog: close,
    showServerStatus: () =>
      list.serverOnline ? tell('Server', 'The server is online and connected.') : tell(...explain('offline', '')),
    createNetwork: () =>
      list.serverOnline ? tell('Create a new network', 'This is not part of this demo yet.') : tell(...explain('offline', '')),
    logout: () => logout.execute(),
  }
}
