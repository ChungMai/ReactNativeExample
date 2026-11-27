// View model of the room detail screens. Swift: RoomDetailViewModel.
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { COVERS } from '../assets/covers'
import type { RoomDetailDisplay } from '../models/room-display'

export function useRoomDetailScreen(id: string | undefined) {
  const list = container.serverRooms
  const { rooms, members, loaded } = useSyncExternalStore(list.subscribe, list.get)

  useEffect(() => {
    if (!id) return
    // the list may be empty when the page is opened directly; a failure leaves what was known
    list.refresh().catch(() => {})
    list.loadMembers(id)
  }, [id, list])

  const detail = useMemo((): RoomDetailDisplay | undefined => {
    const room = rooms.find(r => r.id === id)
    if (!room) return undefined
    const state = members[room.id]
    const content = typeof state === 'object' ? state : undefined
    const devices = content?.devices ?? []
    const isOn = room.isOn ?? devices.some(d => d.isOn)
    return {
      id: room.id,
      title: room.name,
      // the room's own picture is not loaded: a bundled one stands in
      coverSource: COVERS[Number(room.id) % COVERS.length],
      isOn,
      switchLabel: isOn ? 'Switch On' : 'Switch Off',
      devices: devices.map(d => ({
        id: d.id,
        title: d.name,
        kind: d.kind,
        isOn: d.isOn === true,
        hasSwitch: !d.unreachable && d.isOn !== undefined,
        note: d.unreachable ? 'Unreachable' : undefined,
      })),
      presets: content?.presets ?? [],
      devicesMessage: content ? undefined : state === 'error' ? 'Could not load this room.' : 'Loading devices...',
    }
  }, [id, rooms, members])

  return { detail, missingText: loaded ? 'Room not found' : 'Loading room...' }
}
