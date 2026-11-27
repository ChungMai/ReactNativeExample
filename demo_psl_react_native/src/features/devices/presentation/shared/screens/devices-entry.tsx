// Real devices after a real sign-in, the demo screen for the demo account.
import type { ComponentType } from 'react'
import { container } from '../../../../../di/container'
import { ServerDevicesScreen } from './server-devices-screen'

export function withServerDevices(DemoScreen: ComponentType) {
  return function DevicesEntry() {
    const list = container.serverDevices
    return list.isActive() ? <ServerDevicesScreen list={list} /> : <DemoScreen />
  }
}
