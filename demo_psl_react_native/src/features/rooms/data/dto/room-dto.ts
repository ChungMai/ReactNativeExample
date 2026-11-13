/** Shape of a room as stored/returned by the API and local DB. */
export interface RoomDTO {
  id: string
  name: string
  cover_index: number
  device_ids: string[]
  is_favourite: boolean
  created_at: string // ISO 8601
}
