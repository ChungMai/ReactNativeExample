// Web entry of the navigation shell: always the left menu. Below 768px the menu shrinks to icons.
export { SidebarShell as AppShell } from './shared/sidebar-shell'
export { SlotNavigator as MainNavigator } from './shared/slot-navigator'
export { isActive, navItems, type NavItem } from './shared/nav-items'
