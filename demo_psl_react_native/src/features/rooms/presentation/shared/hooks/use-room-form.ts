// Form state shared by the "New Room" and "Edit Room" screens.
import { useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toDeviceDisplay } from '../../../../devices'
import { COVERS } from '../assets/covers'

export interface RoomFormValues {
  name: string
  cover: number
  deviceIds: string[]
}

export function useRoomForm(initial: RoomFormValues) {
  const { getAllDevices, checkRoomName } = container
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const [name, setName] = useState(initial.name)
  const [cover, setCover] = useState(initial.cover)
  const [deviceIds, setDeviceIds] = useState<string[]>(initial.deviceIds)
  const [picking, setPicking] = useState(false)

  const all = useMemo(() => Object.values(devices).map(toDeviceDisplay), [devices])
  const selected = useMemo(() => all.filter(x => deviceIds.includes(x.id)), [all, deviceIds])
  const canSave = checkRoomName.execute(name) // derived, not state

  return {
    devices: all, selectedDevices: selected, name, cover, coverCount: COVERS.length, deviceIds, picking, canSave,
    coverSource: COVERS[cover],
    setName,
    nextCover: () => setCover(c => (c + 1) % COVERS.length),
    togglePicker: () => setPicking(p => !p),
    toggleDevice: (id: string) => setDeviceIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])),
  }
}

export type RoomForm = ReturnType<typeof useRoomForm>
