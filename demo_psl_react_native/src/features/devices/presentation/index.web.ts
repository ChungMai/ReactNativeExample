// WEB entry: which UI the devices feature uses in the browser.
import WebDevicesScreen from './web/screens/devices-screen'
import { withServerDevices } from './shared/screens/devices-entry'

export const DevicesScreen = withServerDevices(WebDevicesScreen)
