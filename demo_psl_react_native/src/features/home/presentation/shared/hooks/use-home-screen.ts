// View model of the Home tab. Swift: HomeMainViewPresenter + the view controller's actions.
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { routes } from '../../../../../shared/routes'
import { buildHomeOverview } from '../../../domain/build-home-overview'
import { toCardDisplay, toSectionDisplay, toSummaryDisplay } from '../mappers/home-display-mapper'
import type { CardDisplay } from '../models/home-display'

export const POLL_INTERVAL_MS = 10_000

export const SERVER_ONLINE_MESSAGE = 'The server is online and connected.'
export const SERVER_OFFLINE_MESSAGE =
  'The server may not exist or it is unavailable at this time. Please check the server / network connection, and try again.'
export const READ_ONLY_MESSAGE = 'This is read only: controlling it is not supported yet.'

export function useHomeScreen() {
  const { getHome, refreshHome, getNetworks, leaveActiveNetwork } = container
  const { snapshot, serverOnline } = useSyncExternalStore(getHome.subscribe, getHome.execute)
  const network = useSyncExternalStore(getNetworks.subscribe, getNetworks.active)

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
        setTooltipVisible(false)
        setNotice(null)
      }
    }, [refreshHome]),
  )

  const overview = useMemo(() => buildHomeOverview(snapshot), [snapshot])
  const { sections, gridCards, summary } = useMemo(() => ({
    sections: overview.sections.map(toSectionDisplay),
    gridCards: overview.gridItems.map(toCardDisplay),
    summary: overview.summary.map(toSummaryDisplay),
  }), [overview])

  return {
    networkName: network?.name ?? '',
    serverOnline,
    tooltip: tooltipVisible ? (serverOnline ? SERVER_ONLINE_MESSAGE : SERVER_OFFLINE_MESSAGE) : null,
    layout: overview.layout,
    summary,
    sections,
    gridCards,
    /** Shown when there is nothing to list. */
    emptyText: (overview.layout === 'custom' ? gridCards.length === 0 : !overview.hasFavourites)
      ? 'No favourites yet.'
      : null,
    notice,
    refreshing,

    toggleTooltip: () => setTooltipVisible(v => !v),
    closeOverlays: () => setTooltipVisible(false),
    dismissNotice: () => setNotice(null),
    openNetworks: () => leaveActiveNetwork.execute(),

    refresh: async () => {
      setRefreshing(true)
      setNotice(null)
      try {
        await refreshHome.execute()
      } catch (e) {
        setNotice(userMessage(toAppError(e)))
      } finally {
        setRefreshing(false)
      }
    },

    /** A room opens its page; nothing else can be done with the other cards. */
    open: (card: CardDisplay) => {
      setTooltipVisible(false)
      if (card.kind === 'room') return router.push(routes.room(card.id))
      setNotice(READ_ONLY_MESSAGE)
    },
  }
}

export type HomeViewModel = ReturnType<typeof useHomeScreen>
