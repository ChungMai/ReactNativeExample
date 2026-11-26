// iOS + Android entry: mobile/ in a compact window, desktop/ in a regular one (iPad, Mac).
import { adaptive } from '../../../shared/components/adaptive'
import MobileGroupsScreen from './mobile/screens/groups-screen'
import DesktopGroupsScreen from './desktop/screens/groups-screen'

export const GroupsScreen = adaptive(MobileGroupsScreen, DesktopGroupsScreen)
