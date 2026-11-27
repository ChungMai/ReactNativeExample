import { router } from 'expo-router'
import { useMemo, useSyncExternalStore } from 'react'
import { routes } from '../../../../../shared/routes'
import { container } from '../../../../../di/container'
import { toRoomWithDevices } from '../../../domain/room-with-power'
import { toRoomDetailDisplay } from '../mappers/room-display-mapper'
import type { RoomDetailDisplay } from '../models/room-display'
import { useServerRoomDetail } from './use-server-room-detail'

export function useRoomDetailScreen(id: string | undefined) {
  const { getRoomDetailInfo, getAllDevices, deleteRoom, updateRoomAttributes, triggerRoom, toggleDevice } = container
  const room = useSyncExternalStore(getRoomDetailInfo.subscribe, () => getRoomDetailInfo.execute(id))
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const detail = useMemo(() => toRoomWithDevices(room, devices), [room, devices])
  const demo = useMemo(() => (detail ? toRoomDetailDisplay(detail) : undefined), [detail])
  const server = useServerRoomDetail(id)
  const display: RoomDetailDisplay | undefined = server.active ? server.detail : demo

  return {
    detail: display,
    missingText: server.loading ? 'Loading room...' : 'Room not found',
    setPower: (on: boolean) => detail && triggerRoom.execute(detail.room.id, on),
    toggleFavourite: () => detail && updateRoomAttributes.execute(detail.room.id, { favourite: !detail.room.favourite }),
    toggleDevice: (deviceId: string) => toggleDevice.execute(deviceId),
    editRoom: () => detail && router.push(routes.editRoom(detail.room.id)),
    deleteRoom: () => {
      if (!detail) return
      deleteRoom.execute(detail.room.id)
      router.back()
    },
  }
}
