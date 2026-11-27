import type { DeviceKind } from '../../../devices'

export interface DeviceCollectionDTO { id: string; name: string; device_ids: string[]; is_on?: boolean }
export interface SceneDTO { id: string; name: string; actions: { device_id: string; is_on: boolean }[] }

export interface HomeDTO {
  network: { network_name: string; access_mode: 'local' | 'remote'; user_role: 'primary' | 'secondary' }
  favourites: { devices: string[]; groups: string[]; zones: string[]; scenes: string[]; presets: string[] }
  groups: DeviceCollectionDTO[]
  zones: DeviceCollectionDTO[]
  scenes: SceneDTO[]
  presets: SceneDTO[]
  /** Real server only: states come with the home, not from the demo devices and rooms. */
  live?: {
    devices: { id: string; name: string; kind: DeviceKind; is_on: boolean }[]
    rooms: { id: string; name: string; is_on?: boolean }[]
    on_counts: { device: number; room: number; group: number; zone: number }
  }
  customization?: {
    layout: 'defaultLayout' | 'customLayout'
    favourite_sections: { type: 'scene' | 'device' | 'room' | 'group' | 'zone' | 'preset'; name: string; is_hidden: boolean }[]
    summary: { is_hidden: boolean; items: { type: 'device' | 'room' | 'group' | 'zone'; is_hidden: boolean }[] }
    items_position: { id: string; position: number }[]
  }
}
