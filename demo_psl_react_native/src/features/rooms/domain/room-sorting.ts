import { assertNever } from '../../../shared/domain/assert-never'
import type { Room } from './entities/room'

export type SortKey = 'alphabetical' | 'recent'
export type SortDir = 'asc' | 'desc'

function compare(a: Room, b: Room, key: SortKey): number {
  switch (key) {
    case 'alphabetical': return a.name.localeCompare(b.name)
    case 'recent':       return b.createdAt - a.createdAt
    default:             return assertNever(key)
  }
}

export function searchAndSortRooms(rooms: Room[], query: string, key: SortKey, dir: SortDir): Room[] {
  const q = query.trim().toLowerCase()
  const sign = dir === 'asc' ? 1 : -1
  return rooms
    .filter(r => r.name.toLowerCase().includes(q))
    .sort((a, b) => sign * compare(a, b, key))
}
