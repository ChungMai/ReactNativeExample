// The More tab is a menu. Swift: MoreViewPresenter; "Log out" lives in the profile page there.
import { router } from 'expo-router'
import { useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { routes } from '../../../../../shared/routes'
import type { IconName } from '../../../../../shared/navigation/shared/nav-items'
import { sectionsFor } from '../../../domain/more-sections'

export type MoreItem = {
  id: string
  title: string
  icon: IconName
  subtitle?: string
  open: () => void
}

export function useMoreScreen() {
  const { getNetworks, getSession, logout } = container
  const network = useSyncExternalStore(getNetworks.subscribe, getNetworks.active)

  const sections: MoreItem[] = sectionsFor(network?.role ?? 'secondary').map(s => ({
    id: s.id,
    title: s.title,
    icon: s.icon,
    open: () => router.push(routes.moreSection(s.id)),
  }))
  const app: MoreItem[] = [
    {
      id: 'hooks-demo',
      title: 'React hooks demo',
      icon: 'code-slash',
      subtitle: 'useState, useEffect, useRef, custom hooks and the React Native hooks',
      open: () => router.push(routes.hooksDemo),
    },
    {
      id: 'logout',
      title: 'Log out',
      icon: 'log-out-outline',
      subtitle: getSession.execute()?.email,
      open: () => logout.execute(),
    },
  ]
  return { groups: [sections, app] }
}
