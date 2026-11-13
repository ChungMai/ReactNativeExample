// Home has no data of its own: it shows favourite rooms from the rooms feature.
import { router } from 'expo-router'
import { useMemo, useSyncExternalStore } from 'react'
import { container } from '../../../../di/container'
import { routes } from '../../../../shared/routes'
import { toRoomDisplay, toRoomsWithPower } from '../../../rooms'

export function useHomeScreen() {
  const { getAllRooms, getAllDevices } = container
  const rooms = useSyncExternalStore(getAllRooms.subscribe, getAllRooms.execute)
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const favourites = useMemo(
    () => toRoomsWithPower(rooms.filter(r => r.favourite), devices).map(toRoomDisplay),
    [rooms, devices],
  )
  return { favourites, openRoom: (id: string) => router.push(routes.room(id)) }
}
