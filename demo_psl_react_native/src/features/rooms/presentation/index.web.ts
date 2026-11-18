// WEB entry: the one place that decides which UI the rooms feature uses in the browser.
export { default as RoomsScreen } from './web/screens/rooms-screen'
export { RoomCard } from './web/components/room-card'
export { default as RoomDetailScreen } from './web/screens/room-detail-screen'
// One UI for both platforms (no web/ version yet)
export { default as NewRoomScreen } from './shared/screens/new-room-screen'
export { default as EditRoomScreen } from './shared/screens/edit-room-screen'
