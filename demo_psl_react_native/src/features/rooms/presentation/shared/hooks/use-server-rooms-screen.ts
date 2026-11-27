// View model of the real room list. Swift: RoomsMainViewModel.
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { routes } from '../../../../../shared/routes'
import type { ServerRoomList } from '../../../data/server-room-list'

export function useServerRoomsScreen(list: ServerRoomList) {
  const { rooms, loaded, serverOnline } = useSyncExternalStore(list.subscribe, list.get)
  const [search, setSearch] = useState('')
  const [ascending, setAscending] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      await list.refresh()
      setError(null)
    } catch (e) {
      setError(userMessage(toAppError(e)))
    }
  }, [list])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const shown = useMemo(() => {
    const text = search.trim().toLowerCase()
    const direction = ascending ? 1 : -1
    return rooms
      .filter(r => r.name.toLowerCase().includes(text))
      .sort((a, b) => direction * a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [rooms, search, ascending])

  return {
    loaded,
    serverOnline,
    error,
    refreshing,
    search,
    setSearch,
    ascending,
    toggleSort: () => setAscending(v => !v),
    hasRooms: rooms.length > 0,
    rooms: shown,
    openRoom: (id: string) => router.push(routes.room(id)),
    refresh: async () => {
      setRefreshing(true)
      await load()
      setRefreshing(false)
    },
  }
}
