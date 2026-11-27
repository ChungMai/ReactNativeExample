// MOBILE: no extra frame around the screens; the tab bar is the navigation.
import type { ShellProps } from '../shared/sidebar-shell'

export function AppShell({ children }: ShellProps) {
  return <>{children}</>
}
