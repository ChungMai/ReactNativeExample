export interface Room {
  readonly id: string
  name: string
  cover: number // index of the cover image (resolved by the presenter)
  deviceIds: string[]
  favourite: boolean
  createdAt: number
}

/** What the "New Room" form produces. */
export type NewRoom = Pick<Room, 'name' | 'cover' | 'deviceIds'>

/** Fields that can be edited after creation. */
export type RoomAttributes = Partial<Pick<Room, 'name' | 'cover' | 'favourite' | 'deviceIds'>>
