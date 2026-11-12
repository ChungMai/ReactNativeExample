// Custom hook: search + sort, memoized. useDeferredValue keeps typing smooth.
import { useDeferredValue, useMemo } from 'react'
import { powerOf, useRoomsState } from '../store/rooms'
import { assertNever, type Room, type RoomPower, type SortDir, type SortKey } from '../types'

export type RoomCardData = { room: Room; power: RoomPower }

function compare(a: Room, b: Room, key: SortKey): number {
  switch (key) {
    case 'alphabetical': return a.name.localeCompare(b.name)
    case 'recent':       return b.createdAt - a.createdAt
    default:             return assertNever(key)
  }
}

export function useSortedRooms(query: string, key: SortKey, dir: SortDir): RoomCardData[] {
  const { rooms, devices } = useRoomsState()
  const deferred = useDeferredValue(query)

  return useMemo(() => {
    const q = deferred.trim().toLowerCase()
    const sign = dir === 'asc' ? 1 : -1
    return rooms
      .filter(r => r.name.toLowerCase().includes(q))
      .sort((a, b) => sign * compare(a, b, key))
      .map(room => ({ room, power: powerOf(room.deviceIds.map(id => devices[id])) }))
  }, [rooms, devices, deferred, key, dir])
}
