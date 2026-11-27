// View model of "Select Server". Swift: SelectServerViewPresenter.
import { router } from 'expo-router'
import { useRef, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { ServerError, type ServerErrorCode } from '../../../domain/server-error'
import { CUSTOM_SERVER, DEFAULT_SERVER, serverLabel } from './server-label'

type Choice = { kind: 'default' } | { kind: 'saved'; url: string } | { kind: 'custom' }

const UNREACHABLE =
  'Not able to connect to the server URL / IP Address. The server may not exist or it is unavailable at this time. Please check the server URL or IP address, check your network connection, and try again.'
const ERRORS: Record<ServerErrorCode, string> = {
  empty: 'Empty Field',
  invalid: 'Invalid address format',
  unreachable: UNREACHABLE,
  unsupported: 'This server uses a sign-in method that is not part of this demo.',
}

export function useSelectServerScreen() {
  const { getServerSettings, connectServer, removeServer } = container
  const settings = useSyncExternalStore(getServerSettings.subscribe, getServerSettings.execute, getServerSettings.execute)
  const [choice, setChoice] = useState<Choice>(() =>
    settings.selected ? { kind: 'saved', url: settings.selected } : { kind: 'default' })
  const [address, setAddress] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const busy = useRef(false)

  const pick = (next: Choice) => () => {
    setChoice(next)
    setAddress('')
    setError(null)
    setListOpen(false)
  }

  const option = (label: string, next: Choice, active: boolean, url?: string) => ({
    label,
    active,
    onPress: pick(next),
    // only servers the user added can be removed
    onRemove: url
      ? () => {
          removeServer.execute(url)
          if (choice.kind === 'saved' && choice.url === url) setChoice({ kind: 'default' })
        }
      : undefined,
  })

  return {
    selectedLabel:
      choice.kind === 'saved' ? serverLabel(choice.url) : choice.kind === 'custom' ? CUSTOM_SERVER : DEFAULT_SERVER,
    isCustom: choice.kind === 'custom',
    options: [
      option(DEFAULT_SERVER, { kind: 'default' }, choice.kind === 'default'),
      ...settings.saved.map(url =>
        option(serverLabel(url), { kind: 'saved', url }, choice.kind === 'saved' && choice.url === url, url)),
      option(CUSTOM_SERVER, { kind: 'custom' }, choice.kind === 'custom'),
    ],
    listOpen,
    openList: () => setListOpen(true),
    closeList: () => setListOpen(false),
    address,
    setAddress: (text: string) => {
      setAddress(text)
      setError(null)
    },
    error,
    connecting,

    next: async () => {
      if (busy.current) return
      busy.current = true
      setConnecting(true)
      setError(null)
      try {
        if (choice.kind === 'default') connectServer.useDefault()
        else await connectServer.execute(choice.kind === 'saved' ? choice.url : address)
        // On web the page can be opened or reloaded directly, with nothing to go back to.
        if (router.canGoBack()) router.back()
        else router.replace('/')
      } catch (e) {
        setError(e instanceof ServerError ? ERRORS[e.code] : UNREACHABLE)
      } finally {
        busy.current = false
        setConnecting(false)
      }
    },
  }
}
