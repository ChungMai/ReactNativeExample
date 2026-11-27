// Swift: PSLMembersSelectionCollapsibleViewController opened with fromActivity = .addFavorite.
import { router } from 'expo-router'
import { useState } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { FAVOURITE_KINDS, type FavouriteKind } from '../../../domain/entities/favourites'
import type { FavouriteSelection } from '../../../domain/use-cases/save-favourites'
import { SECTION_TITLES } from '../mappers/home-display-mapper'

const GROUP_TITLES: Record<FavouriteKind, string> = Object.fromEntries(
  FAVOURITE_KINDS.map(kind => [kind, SECTION_TITLES[kind].replace('Favourite ', '')]),
) as Record<FavouriteKind, string>

export function useAddFavouritesScreen() {
  const { getHome, getAllRooms, getAllDevices, saveFavourites } = container

  // The form is a draft: read once on open, so polling cannot overwrite what the user ticked.
  const [initial] = useState(() => {
    const { snapshot } = getHome.execute()
    const rooms = getAllRooms.execute()
    const options: Record<FavouriteKind, { id: string; name: string }[]> = {
      scene: snapshot.scenes,
      device: Object.values(getAllDevices.execute()),
      room: rooms,
      group: snapshot.groups,
      zone: snapshot.zones,
      preset: snapshot.presets,
    }
    const selection: FavouriteSelection = { ...snapshot.favourites, room: rooms.filter(r => r.favourite).map(r => r.id) }
    return { options, selection }
  })
  const [selection, setSelection] = useState(initial.selection)
  const [error, setError] = useState<string | null>(null)

  return {
    error,
    groups: FAVOURITE_KINDS.filter(kind => initial.options[kind].length > 0).map(kind => ({
      kind,
      title: GROUP_TITLES[kind],
      options: initial.options[kind].map(({ id, name }) => ({ id, name, selected: selection[kind].includes(id) })),
    })),
    toggle: (kind: FavouriteKind, id: string) =>
      setSelection(s => ({
        ...s,
        [kind]: s[kind].includes(id) ? s[kind].filter(x => x !== id) : [...s[kind], id],
      })),
    save: () => {
      try {
        saveFavourites.execute(selection)
        router.back()
      } catch (e) {
        setError(userMessage(toAppError(e)))
      }
    },
  }
}
