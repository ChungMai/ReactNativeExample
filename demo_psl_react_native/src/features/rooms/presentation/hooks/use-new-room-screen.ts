import { router } from 'expo-router'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../di/container'
import { toDeviceDisplay } from '../../../devices'
import { COVERS } from '../assets/covers'

export function useNewRoomScreen() {
  const { getAllDevices, checkRoomName, createRoom } = container
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const [name, setName] = useState('')
  const [cover, setCover] = useState(0)
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [picking, setPicking] = useState(false)

  const all = useMemo(() => Object.values(devices).map(toDeviceDisplay), [devices])
  const selected = useMemo(() => all.filter(x => deviceIds.includes(x.id)), [all, deviceIds])
  const canSave = checkRoomName.execute(name) // derived, not state

  return {
    devices: all, selectedDevices: selected, name, cover, coverCount: COVERS.length, deviceIds, picking, canSave,
    setName,
    nextCover: () => setCover(c => (c + 1) % COVERS.length),
    togglePicker: () => setPicking(p => !p),
    toggleDevice: (id: string) => setDeviceIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])),
    save: () => {
      if (!canSave) return
      createRoom.execute({ name, cover, deviceIds })
      router.back()
    },
  }
}
