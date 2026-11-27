import { container } from '../../../../../di/container'
import { ServerRoomsScreen } from './server-rooms-screen'

export function RoomsScreen() {
  return <ServerRoomsScreen list={container.serverRooms} />
}
