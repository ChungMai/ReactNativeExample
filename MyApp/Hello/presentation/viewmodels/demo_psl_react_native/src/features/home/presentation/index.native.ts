// iOS + Android entry: mobile/ in a compact window, desktop/ in a regular one (iPad, Mac).
import { adaptive } from '../../../shared/components/adaptive'
import MobileHomeScreen from './mobile/screens/home-screen'
import DesktopHomeScreen from './desktop/screens/home-screen'

export const HomeScreen = adaptive(MobileHomeScreen, DesktopHomeScreen)
