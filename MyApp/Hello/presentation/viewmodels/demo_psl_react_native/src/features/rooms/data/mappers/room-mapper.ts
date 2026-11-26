import type { Room } from '../../domain/entities/room'
import type { RoomDTO } from '../dto/room-dto'

export const roomToDomain = (dto: RoomDTO): Room => ({
  id: dto.id,
  name: dto.name,
  cover: dto.cover_index,
  deviceIds: dto.device_ids,
  favourite: dto.is_favourite,
  createdAt: Date.parse(dto.created_at),
})

export const roomToDTO = (r: Room): RoomDTO => ({
  id: r.id,
  name: r.name,
  cover_index: r.cover,
  device_ids: r.deviceIds,
  is_favourite: r.favourite,
  created_at: new Date(r.createdAt).toISOString(),
})
