import type { RoomDTO } from './dto/room-dto'

const at = (ms: number) => new Date(ms).toISOString()

export const ROOM_SEED: RoomDTO[] = [
  { id: 'r1', name: 'Room 11', cover_index: 0, device_ids: [], is_favourite: true, created_at: at(1) },
  { id: 'r2', name: 'Virtual Room', cover_index: 5, device_ids: ['d1', 'd2', 'd3'], is_favourite: false, created_at: at(2) },
  { id: 'r3', name: 'Bedroom', cover_index: 3, device_ids: ['d6'], is_favourite: false, created_at: at(3) },
]
