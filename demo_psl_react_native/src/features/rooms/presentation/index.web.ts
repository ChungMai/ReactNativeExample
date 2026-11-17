// WEB entry: the one place that decides which UI the rooms feature uses in the browser.
export { default as RoomsScreen } from './web/screens/rooms-screen'
export { RoomCard } from './web/components/room-card'
// One UI for both platforms (no mobile/ or web/ version yet)
export { default as RoomDetailScreen } from './shared/screens/room-detail-screen'
export { default as NewRoomScreen } from './shared/screens/new-room-screen'
