// The app's main destinations, defined ONCE. The mobile bottom tab bar and the web left menu
// both render this list, so a new destination is added in one place and shows up on every platform.
import type Ionicons from '@expo/vector-icons/Ionicons'
import type { Href } from 'expo-router'
import type { ComponentProps } from 'react'

export type IconName = ComponentProps<typeof Ionicons>['name']

export type NavItem = {
  /** File name inside app/(tabs)/, e.g. "rooms" for app/(tabs)/rooms.tsx */
  name: string
  title: string
  icon: IconName
  href: Href
  /** Path prefixes that highlight this item (the Rooms item is also active on /room/[id]) */
  match: string[]
  /** Show the native header on mobile. Home and Rooms draw their own header. */
  header: boolean
}

export const navItems: NavItem[] = [
  { name: 'home', title: 'Home', icon: 'home', href: '/home' as Href, match: ['/home', '/favourites'], header: false },
  { name: 'devices', title: 'Devices', icon: 'bulb', href: '/devices' as Href, match: ['/devices'], header: true },
  { name: 'rooms', title: 'Rooms', icon: 'cube', href: '/rooms' as Href, match: ['/rooms', '/room'], header: false },
  { name: 'groups', title: 'Groups', icon: 'aperture', href: '/groups' as Href, match: ['/groups'], header: true },
  { name: 'more', title: 'More', icon: 'ellipsis-horizontal', href: '/more' as Href, match: ['/more', '/hooks-demo'], header: true },
]

/** True when `pathname` belongs to `item` ("/room/abc" belongs to Rooms). */
export function isActive(item: NavItem, pathname: string): boolean {
  return item.match.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
