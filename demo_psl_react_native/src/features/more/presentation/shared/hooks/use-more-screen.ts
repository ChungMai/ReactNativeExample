// The More tab is a menu. Each entry opens another screen of the app.
import { router } from 'expo-router'
import { container } from '../../../../../di/container'
import { routes } from '../../../../../shared/routes'

export type MoreItem = { id: string; title: string; subtitle: string; open: () => void }

export function useMoreScreen() {
  const items: MoreItem[] = [
    {
      id: 'hooks-demo',
      title: 'React hooks demo',
      subtitle: 'useState, useEffect, useRef, custom hooks and the React Native hooks',
      open: () => router.push(routes.hooksDemo),
    },
    {
      id: 'logout',
      title: 'Log out',
      subtitle: 'Return to the login screen',
      open: () => container.logout.execute(),
    },
  ]
  return { items }
}
