import { useMemo, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { useLoadOnMount } from '../../../../../shared/hooks/use-load-on-mount'
import { toDeviceDisplay } from '../mappers/device-display-mapper'

export function useDevicesScreen() {
  const { getAllDevices, toggleDevice, loadDevices } = container
  const load = useLoadOnMount(loadDevices.execute)
  const devices = useSyncExternalStore(getAllDevices.subscribe, getAllDevices.execute)
  const items = useMemo(() => Object.values(devices).map(toDeviceDisplay), [devices])
  return {
    devices: items,
    toggle: (id: string) => toggleDevice.execute(id),
    status: load.status,
    errorMessage: load.status === 'error' ? load.message : undefined,
    retry: load.retry,
  }
}
