// Public API of the rooms feature. Other features and `app/` may only import from here.
export type { Room } from './domain/entities/room'
export { toRoomsWithPower } from './domain/room-with-power'
export type { RoomDisplay } from './presentation/shared/models/room-display'
export { toRoomDisplay } from './presentation/shared/mappers/room-display-mapper'
// UI: ./presentation/index.native.ts on mobile, ./presentation/index.web.ts on web
export { RoomCard, RoomDetailScreen, RoomsScreen, NewRoomScreen, EditRoomScreen } from './presentation'
