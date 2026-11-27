// Real rooms after a real sign-in, the demo screen for the demo account.
import type { ComponentType } from 'react'
import { container } from '../../../../../di/container'
import { ServerRoomsScreen } from './server-rooms-screen'

export function withServerRooms(DemoScreen: ComponentType) {
  return function RoomsEntry() {
    const list = container.serverRooms
    return list.isActive() ? <ServerRoomsScreen list={list} /> : <DemoScreen />
  }
}
