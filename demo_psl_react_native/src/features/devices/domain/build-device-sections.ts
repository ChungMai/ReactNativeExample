// Swift: processDisplayedData and filterDevices: search, then group by category and sort by name.
import { DEVICE_CATEGORIES, type DeviceCategory, type ListedDevice } from './entities/listed-device'

export interface DeviceSection {
  category: DeviceCategory
  devices: ListedDevice[]
}

export function buildDeviceSections(devices: ListedDevice[], search = '', ascending = true): DeviceSection[] {
  const text = search.trim().toLowerCase()
  const direction = ascending ? 1 : -1
  const shown = devices
    .filter(d => d.name.toLowerCase().includes(text))
    .sort((a, b) => direction * a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  return DEVICE_CATEGORIES
    .map(category => ({ category, devices: shown.filter(d => d.category === category) }))
    .filter(section => section.devices.length > 0)
}
