import { container } from '../../../../../di/container'
import { ServerDevicesScreen } from './server-devices-screen'

export function DevicesScreen() {
  return <ServerDevicesScreen list={container.serverDevices} />
}
