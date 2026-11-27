// View model of the real device list. Swift: DeviceMainCollapsiblePresenter.
import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import type { ServerDeviceList } from '../../../data/server-device-list'
import { buildDeviceSections } from '../../../domain/build-device-sections'
import type { DeviceCategory } from '../../../domain/entities/listed-device'

export function useServerDevicesScreen(list: ServerDeviceList) {
  const { devices, loaded, serverOnline } = useSyncExternalStore(list.subscribe, list.get)
  const [search, setSearch] = useState('')
  const [ascending, setAscending] = useState(true)
  const [expanded, setExpanded] = useState<DeviceCategory[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      await list.refresh()
      setError(null)
    } catch (e) {
      setError(userMessage(toAppError(e)))
    }
  }, [list])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const sections = useMemo(() => buildDeviceSections(devices, search, ascending), [devices, search, ascending])
  const searching = search.trim() !== ''

  return {
    loaded,
    serverOnline,
    error,
    refreshing,
    search,
    setSearch,
    ascending,
    toggleSort: () => setAscending(v => !v),
    hasDevices: devices.length > 0,
    sections: sections.map(s => ({
      category: s.category,
      count: s.devices.length,
      // a search shows its matches without having to open the sections
      isExpanded: searching || expanded.includes(s.category),
      devices: s.devices,
    })),
    toggleSection: (category: DeviceCategory) =>
      setExpanded(open => (open.includes(category) ? open.filter(c => c !== category) : [...open, category])),
    refresh: async () => {
      setRefreshing(true)
      await load()
      setRefreshing(false)
    },
  }
}
