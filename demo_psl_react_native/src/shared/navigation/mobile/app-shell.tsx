// MOBILE: no extra frame around the screens; the tab bar is the navigation.
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return <>{children}</>
}
