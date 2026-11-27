// WEB entry: the one place that decides which UI the rooms feature uses in the browser.
import WebRoomsScreen from './web/screens/rooms-screen'
import { withServerRooms } from './shared/screens/rooms-entry'

export const RoomsScreen = withServerRooms(WebRoomsScreen)
export { RoomCard } from './web/components/room-card'
export { default as RoomDetailScreen } from './web/screens/room-detail-screen'
// One UI for both platforms (no web/ version yet)
export { default as NewRoomScreen } from './shared/screens/new-room-screen'
export { default as EditRoomScreen } from './shared/screens/edit-room-screen'
