import type { Room } from '@/features/rooms/domain/entities/room'
import type { RoomDTO } from '@/features/rooms/data/dto/room-dto'
import { roomToDTO, roomToDomain } from '@/features/rooms/data/mappers/room-mapper'

const dto: RoomDTO = {
  id: 'r1', name: 'Bedroom', cover_index: 3, device_ids: ['d1', 'd2'],
  is_favourite: true, created_at: '2024-01-02T03:04:05.000Z',
}

describe('room mapper', () => {
  it('maps a DTO to the domain entity', () => {
    expect(roomToDomain(dto)).toEqual({
      id: 'r1', name: 'Bedroom', cover: 3, deviceIds: ['d1', 'd2'],
      favourite: true, createdAt: Date.parse('2024-01-02T03:04:05.000Z'),
    })
  })

  it('maps an entity back to a DTO', () => {
    const room: Room = roomToDomain(dto)
    expect(roomToDTO(room)).toEqual(dto)
  })
})
