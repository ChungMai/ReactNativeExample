import { router } from 'expo-router'
import { container } from '../../../../../di/container'
import { useRoomForm } from './use-room-form'

export function useNewRoomScreen() {
  const form = useRoomForm({ name: '', cover: 0, deviceIds: [] })
  const { name, cover, deviceIds, canSave } = form

  return {
    ...form,
    save: () => {
      if (!canSave) return
      container.createRoom.execute({ name, cover, deviceIds })
      router.back()
    },
  }
}
