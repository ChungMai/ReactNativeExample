// Typed route contracts. Expo Router generates the allowed paths (experiments.typedRoutes),
// so a wrong path or a missing `id` param is a compile error.
import type { Href } from 'expo-router'

export const routes = {
  room: (id: string): Href => ({ pathname: '/room/[id]', params: { id } }),
  editRoom: (id: string): Href => ({ pathname: '/room/edit/[id]', params: { id } }),
  newRoom: '/room/new' as Href,
  addFavourites: '/favourites/add' as Href,
  selectServer: '/select-server' as Href,
  hooksDemo: '/hooks-demo' as Href,
}
