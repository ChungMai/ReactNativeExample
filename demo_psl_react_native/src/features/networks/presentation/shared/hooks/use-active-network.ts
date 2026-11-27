import { useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'

export function useActiveNetwork() {
  const { getNetworks } = container
  return useSyncExternalStore(getNetworks.subscribe, getNetworks.active, getNetworks.active)
}
