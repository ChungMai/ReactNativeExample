import { router } from 'expo-router'
import { useMemo, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toRoomWithDevices } from '../../../domain/room-with-power'
import { toRoomDetailDisplay } from '../mappers/room-display-mapper'

export function useRoomDetailScreen(id: string | undefined) {
  const { getRoomDetailInfo, getAllDevices, deleteRoom, updateRoomAttributes, triggerRoom, toggleDevice } = container
  const room = useSyncExternalStore(getRoomDetailInfo.subscribe, () => getRoomDetailInfo.execute(id))
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const detail = useMemo(() => toRoomWithDevices(room, devices), [room, devices])
  const display = useMemo(() => (detail ? toRoomDetailDisplay(detail) : undefined), [detail])

  return {
    detail: display,
    setPower: (on: boolean) => detail && triggerRoom.execute(detail.room.id, on),
    toggleFavourite: () => detail && updateRoomAttributes.execute(detail.room.id, { favourite: !detail.room.favourite }),
    toggleDevice: (deviceId: string) => toggleDevice.execute(deviceId),
    deleteRoom: () => {
      if (!detail) return
      deleteRoom.execute(detail.room.id)
      router.back()
    },
  }
}
