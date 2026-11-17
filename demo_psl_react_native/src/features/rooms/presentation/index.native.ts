// iOS + Android entry: the one place that decides which UI the rooms feature uses.
// It chooses by window size, live (see src/shared/hooks/use-size-class.ts):
//   compact → mobile/  (iPhone, iPad in a narrow Split View)
//   regular → desktop/  (iPad full screen, Mac window "Designed for iPad")
// Metro picks this file on iOS and Android and index.web.ts on web.
import { adaptive } from '../../../shared/components/adaptive'
import { RoomCard as MobileRoomCard } from './mobile/components/room-card'
import MobileRoomsScreen from './mobile/screens/rooms-screen'
import { RoomCard as DesktopRoomCard } from './desktop/components/room-card'
import DesktopRoomsScreen from './desktop/screens/rooms-screen'

export const RoomsScreen = adaptive(MobileRoomsScreen, DesktopRoomsScreen)
export const RoomCard = adaptive(MobileRoomCard, DesktopRoomCard)
// One UI for every size (no mobile/, desktop/ or web/ version yet)
export { default as RoomDetailScreen } from './shared/screens/room-detail-screen'
export { default as NewRoomScreen } from './shared/screens/new-room-screen'
export { default as EditRoomScreen } from './shared/screens/edit-room-screen'
