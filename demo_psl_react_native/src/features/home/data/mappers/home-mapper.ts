import type { DeviceCollection, FavouriteIds, HomeSnapshot, Scene } from '../../domain/entities/favourites'
import type { DeviceCollectionDTO, HomeDTO, SceneDTO } from '../dto/home-dto'

const unique = (ids: string[]) => [...new Set(ids)]
const toCollection = (d: DeviceCollectionDTO): DeviceCollection => ({ id: d.id, name: d.name, deviceIds: d.device_ids })
const toScene = (d: SceneDTO): Scene => ({
  id: d.id,
  name: d.name,
  states: Object.fromEntries(d.actions.map(a => [a.device_id, a.is_on])),
})

export function homeToDomain(dto: HomeDTO): HomeSnapshot {
  const { network, favourites, customization: c } = dto
  return {
    network: { name: network.network_name, mode: network.access_mode, isPrimaryUser: network.user_role === 'primary' },
    favourites: {
      device: unique(favourites.devices),
      group: unique(favourites.groups),
      zone: unique(favourites.zones),
      scene: unique(favourites.scenes),
      preset: unique(favourites.presets),
    },
    groups: dto.groups.map(toCollection),
    zones: dto.zones.map(toCollection),
    scenes: dto.scenes.map(toScene),
    presets: dto.presets.map(toScene),
    customization: c && {
      layout: c.layout === 'customLayout' ? 'custom' : 'default',
      sections: c.favourite_sections.map(s => ({ kind: s.type, title: s.name, hidden: s.is_hidden })),
      summary: { hidden: c.summary.is_hidden, items: c.summary.items.map(i => ({ kind: i.type, hidden: i.is_hidden })) },
      itemPositions: c.items_position,
    },
  }
}

export function favouritesToDTO(f: FavouriteIds): HomeDTO['favourites'] {
  return { devices: f.device, groups: f.group, zones: f.zone, scenes: f.scene, presets: f.preset }
}
