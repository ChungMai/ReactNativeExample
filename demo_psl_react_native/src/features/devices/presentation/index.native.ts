// iOS + Android entry: mobile/ in a compact window, desktop/ in a regular one (iPad, Mac).
import { adaptive } from '../../../shared/components/adaptive'
import MobileDevicesScreen from './mobile/screens/devices-screen'
import DesktopDevicesScreen from './desktop/screens/devices-screen'
import { withServerDevices } from './shared/screens/devices-entry'

export const DevicesScreen = withServerDevices(adaptive(MobileDevicesScreen, DesktopDevicesScreen))
