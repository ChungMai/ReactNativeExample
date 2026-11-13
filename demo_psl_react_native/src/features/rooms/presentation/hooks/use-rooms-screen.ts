import { router } from 'expo-router'
import { useDeferredValue, useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../di/container'
import { useLoadOnMount } from '../../../../shared/hooks/use-load-on-mount'
import { routes } from '../../../../shared/routes'
import { searchAndSortRooms, type SortDir, type SortKey } from '../../domain/room-sorting'
import { toRoomsWithPower } from '../../domain/room-with-power'
import { toRoomDisplay } from '../mappers/room-display-mapper'

export function useRoomsScreen() {
  const { getAllRooms, getAllDevices, loadRooms } = container
  const load = useLoadOnMount(loadRooms.execute)
  const rooms = useSyncExternalStore(getAllRooms.subscribe, getAllRooms.execute)
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('alphabetical')
  const [dir, setDir] = useState<SortDir>('asc')
  const deferredQuery = useDeferredValue(query) // keeps typing smooth

  const cards = useMemo(
    () => toRoomsWithPower(searchAndSortRooms(rooms, deferredQuery, sortKey, dir), devices).map(toRoomDisplay),
    [rooms, devices, deferredQuery, sortKey, dir],
  )

  return {
    cards, searching, query, sortKey, dir,
    status: load.status,
    errorMessage: load.status === 'error' ? load.message : undefined,
    retry: load.retry,
    setQuery, setSortKey,
    toggleDir: () => setDir(d => (d === 'asc' ? 'desc' : 'asc')),
    toggleSearch: () => { setSearching(s => !s); setQuery('') },
    openRoom: (id: string) => router.push(routes.room(id)),
    openNewRoom: () => router.push(routes.newRoom),
  }
}
