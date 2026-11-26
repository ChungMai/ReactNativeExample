// iOS + Android entry: mobile/ in a compact window, desktop/ in a regular one (iPad, Mac).
import { adaptive } from '../../../shared/components/adaptive'
import DesktopMoreScreen from './desktop/screens/more-screen'
import MobileMoreScreen from './mobile/screens/more-screen'

export const MoreScreen = adaptive(MobileMoreScreen, DesktopMoreScreen)
