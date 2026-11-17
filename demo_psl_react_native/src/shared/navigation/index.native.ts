// iOS + Android entry of the navigation shell. It chooses by window size, live:
//   compact (phone, narrow Split View) → bottom tab bar, no frame        (mobile/)
//   regular (iPad, Mac window)         → left menu next to the page      (shared/)
import { adaptive } from '../components/adaptive'
import { AppShell as PhoneShell } from './mobile/app-shell'
import { MainNavigator as PhoneNavigator } from './mobile/main-navigator'
import { SidebarShell } from './shared/sidebar-shell'
import { SlotNavigator } from './shared/slot-navigator'

export const AppShell = adaptive(PhoneShell, SidebarShell)
export const MainNavigator = adaptive(PhoneNavigator, SlotNavigator)
export { isActive, navItems, type NavItem } from './shared/nav-items'
