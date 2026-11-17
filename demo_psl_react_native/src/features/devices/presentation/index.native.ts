// iOS + Android entry: mobile/ in a compact window, desktop/ in a regular one (iPad, Mac).
import { adaptive } from '../../../shared/components/adaptive'
import MobileDevicesScreen from './mobile/screens/devices-screen'
import DesktopDevicesScreen from './desktop/screens/devices-screen'

export const DevicesScreen = adaptive(MobileDevicesScreen, DesktopDevicesScreen)
