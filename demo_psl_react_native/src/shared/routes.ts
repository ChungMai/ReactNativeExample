// Typed route contracts. Expo Router generates the allowed paths (experiments.typedRoutes),
// so a wrong path or a missing `id` param is a compile error.
import type { Href } from 'expo-router'

export const routes = {
  room: (id: string): Href => ({ pathname: '/room/[id]', params: { id } }),
  selectServer: '/select-server' as Href,
  moreSection: (section: string): Href => ({ pathname: '/more/[section]', params: { section } }),
  hooksDemo: '/hooks-demo' as Href,
}
