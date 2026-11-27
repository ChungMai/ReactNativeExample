// The frame for wide windows (web, iPad, Mac): left menu + page content.
// It sits above the router's Stack, so the menu stays visible on room detail and New Room too.
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { colors } from '../../theme'
import { Sidebar } from './sidebar'

/** `showMenu` is false on screens without navigation (login). Phones have no menu to hide. */
export type ShellProps = { children: ReactNode; showMenu?: boolean }

export function SidebarShell({ children, showMenu = true }: ShellProps) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.bg }}>
      {showMenu ? <Sidebar /> : null}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}
