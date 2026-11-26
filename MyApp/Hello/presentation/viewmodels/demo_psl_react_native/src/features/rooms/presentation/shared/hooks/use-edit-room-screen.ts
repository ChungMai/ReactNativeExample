import { router } from 'expo-router'
import { useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { useRoomForm } from './use-room-form'

export function useEditRoomScreen(id: string | undefined) {
  const { getRoomDetailInfo, updateRoomAttributes } = container
  const room = useSyncExternalStore(getRoomDetailInfo.subscribe, () => getRoomDetailInfo.execute(id))
  // Initial values come from the stored room; after that the form owns its own state.
  const form = useRoomForm({ name: room?.name ?? '', cover: room?.cover ?? 0, deviceIds: room?.deviceIds ?? [] })
  const { name, cover, deviceIds, canSave } = form

  return {
    ...form,
    found: !!room,
    save: () => {
      if (!room || !canSave) return
      updateRoomAttributes.execute(room.id, { name, cover, deviceIds })
      router.back()
    },
  }
}
