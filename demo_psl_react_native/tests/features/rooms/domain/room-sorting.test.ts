import type { Room } from '@/features/rooms/domain/entities/room'
import { searchAndSortRooms } from '@/features/rooms/domain/room-sorting'

const room = (id: string, name: string, createdAt: number): Room =>
  ({ id, name, cover: 0, deviceIds: [], favourite: false, createdAt })

const rooms = [room('a', 'Kitchen', 3), room('b', 'bedroom', 1), room('c', 'Living room', 2)]
const names = (list: Room[]) => list.map(r => r.name)

describe('searchAndSortRooms', () => {
  it('sorts alphabetically ascending and descending', () => {
    expect(names(searchAndSortRooms(rooms, '', 'alphabetical', 'asc'))).toEqual(['bedroom', 'Kitchen', 'Living room'])
    expect(names(searchAndSortRooms(rooms, '', 'alphabetical', 'desc'))).toEqual(['Living room', 'Kitchen', 'bedroom'])
  })

  it('sorts by recently added (newest first when ascending)', () => {
    expect(names(searchAndSortRooms(rooms, '', 'recent', 'asc'))).toEqual(['Kitchen', 'Living room', 'bedroom'])
    expect(names(searchAndSortRooms(rooms, '', 'recent', 'desc'))).toEqual(['bedroom', 'Living room', 'Kitchen'])
  })

  it('filters by name, ignoring case and surrounding spaces', () => {
    expect(names(searchAndSortRooms(rooms, '  ROOM ', 'alphabetical', 'asc'))).toEqual(['bedroom', 'Living room'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(searchAndSortRooms(rooms, 'zzz', 'alphabetical', 'asc')).toEqual([])
  })

  it('does not mutate the input array order', () => {
    const input = [...rooms]
    searchAndSortRooms(input, '', 'alphabetical', 'asc')
    expect(input).toEqual(rooms)
  })
})
