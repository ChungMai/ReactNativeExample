// View model of the Home tab. Swift: HomeMainViewPresenter + the view controller's actions.
import { router, useFocusEffect, type Href } from 'expo-router'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { routes } from '../../../../../shared/routes'
import { toRoomDisplay, toRoomsWithPower } from '../../../../rooms'
import { buildHomeOverview } from '../../../domain/build-home-overview'
import { toCardDisplay, toSectionDisplay, toSummaryDisplay } from '../mappers/home-display-mapper'
import type { CardDisplay } from '../models/home-display'

export const POLL_INTERVAL_MS = 10_000

export const SERVER_ONLINE_MESSAGE = 'The server is online and connected.'
export const SERVER_OFFLINE_MESSAGE =
  'The server may not exist or it is unavailable at this time. Please check the server / network connection, and try again.'
export const READ_ONLY_MESSAGE = 'This is real data from the server. Controlling it is not part of this demo yet.'
const NOT_PORTED = (what: string) => `${what} is not part of this demo yet.`

export interface MenuAction {
  label: string
  disabled?: boolean
  onPress: () => void
}

export function useHomeScreen() {
  const { getHome, getAllRooms, getAllDevices, refreshHome, activateHomeItem, getNetworks, leaveActiveNetwork } = container
  const { snapshot, serverOnline, readOnly = false } = useSyncExternalStore(getHome.subscribe, getHome.execute)
  const rooms = useSyncExternalStore(getAllRooms.subscribe, getAllRooms.execute)
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)

  const active = useSyncExternalStore(getNetworks.subscribe, getNetworks.active)
  // The network chosen in the list; the hub's own data is the fallback.
  const network = {
    name: active?.name ?? snapshot.network.name,
    isLocal: (active?.mode ?? snapshot.network.mode) === 'local',
    isPrimaryUser: active ? active.role === 'primary' : snapshot.network.isPrimaryUser,
  }

  const [menu, setMenu] = useState<'add' | 'more' | null>(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load and poll only while Home is on screen. A failure shows up as "Offline" with the cached data.
  useFocusEffect(
    useCallback(() => {
      const poll = () => { refreshHome.execute().catch(() => {}) }
      poll()
      const timer = setInterval(poll, POLL_INTERVAL_MS)
      return () => {
        clearInterval(timer)
        setMenu(null)
        setTooltipVisible(false)
        setNotice(null)
      }
    }, [refreshHome]),
  )

  const overview = useMemo(() => buildHomeOverview({ snapshot, rooms, devices }), [snapshot, rooms, devices])

  const { sections, gridCards, summary } = useMemo(() => {
    const covers = new Map(toRoomsWithPower(rooms, devices).map(r => [r.room.id, toRoomDisplay(r).coverSource]))
    const coverOf = (id: string) => covers.get(id)
    return {
      sections: overview.sections.map(s => toSectionDisplay(s, coverOf)),
      gridCards: overview.gridItems.map(i => toCardDisplay(i, coverOf)),
      summary: overview.summary.map(toSummaryDisplay),
    }
  }, [overview, rooms, devices])

  const closeOverlays = () => {
    setMenu(null)
    setTooltipVisible(false)
  }

  /** Closes the menu, then runs the action. */
  const choose = (action: () => void) => () => {
    closeOverlays()
    setNotice(null)
    action()
  }
  const go = (href: Href) => choose(() => router.push(href))
  const notPorted = (what: string) => choose(() => setNotice(NOT_PORTED(what)))

  const addDevice = notPorted('Add Device')
  // the pickers and detail pages only know the demo objects
  const addFavourite = readOnly ? notPorted('Editing favourites') : go(routes.addFavourites)

  const addActions: MenuAction[] = [
    { label: 'Add Device', onPress: addDevice },
    { label: 'Add Hub', disabled: !serverOnline || !network.isLocal, onPress: notPorted('Add Hub') },
    { label: 'Create Group', onPress: go('/groups' as Href) },
    { label: 'Create Room', onPress: go(routes.newRoom) },
    { label: 'Create Zone', onPress: notPorted('Create Zone') },
    { label: 'Add Favourite', disabled: !serverOnline || readOnly, onPress: addFavourite },
  ]
  const moreActions: MenuAction[] = [
    { label: 'Profile', onPress: go('/more' as Href) },
    { label: 'Personalise your home screen', disabled: !serverOnline, onPress: notPorted('Personalise your home screen') },
  ]

  return {
    networkName: network.name,
    accessLabel: network.isLocal ? 'Local' : 'Remote',
    serverOnline,
    tooltip: tooltipVisible ? (serverOnline ? SERVER_ONLINE_MESSAGE : SERVER_OFFLINE_MESSAGE) : null,
    canAdd: network.isPrimaryUser,
    layout: overview.layout,
    summary,
    sections,
    gridCards,
    /** The single tile shown when there is nothing to list. */
    emptyTile: (overview.layout === 'custom' ? gridCards.length === 0 : !overview.hasFavourites)
      ? {
          title: overview.hasDevices ? 'Add Favourite' : 'Add Device',
          disabled: !serverOnline || readOnly,
          onPress: overview.hasDevices ? addFavourite : addDevice,
        }
      : null,
    menu,
    menuActions: menu === 'add' ? addActions : menu === 'more' ? moreActions : [],
    notice,
    refreshing,

    toggleMenu: (which: 'add' | 'more') => {
      setTooltipVisible(false)
      setMenu(open => (open === which ? null : which))
    },
    toggleTooltip: () => {
      setMenu(null)
      setTooltipVisible(v => !v)
    },
    closeOverlays,
    dismissNotice: () => setNotice(null),
    openNetworks: choose(() => leaveActiveNetwork.execute()),

    refresh: async () => {
      setRefreshing(true)
      setNotice(null)
      try {
        await refreshHome.execute(true)
      } catch (e) {
        setNotice(userMessage(toAppError(e)))
      } finally {
        setRefreshing(false)
      }
    },

    /** Tap: switch or trigger the object. */
    activate: (card: CardDisplay) => {
      closeOverlays()
      if (readOnly) return setNotice(READ_ONLY_MESSAGE)
      try {
        activateHomeItem.execute(card)
        setNotice(card.kind === 'scene' || card.kind === 'preset' ? `${card.title} activated` : null)
      } catch (e) {
        setNotice(userMessage(toAppError(e)))
      }
    },

    /** Long press (or the details button): open the object's page. */
    openDetail: (card: CardDisplay) => {
      if (readOnly) return notPorted(`The ${card.kind} page`)()
      if (card.kind === 'room') return go(routes.room(card.id))()
      if (card.kind === 'device') return go('/devices' as Href)()
      notPorted(`The ${card.kind} page`)()
    },
  }
}

export type HomeViewModel = ReturnType<typeof useHomeScreen>
