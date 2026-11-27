// Demo data. Device ids refer to the devices feature's seed.
import type { HomeDTO } from './dto/home-dto'

export const HOME_SEED: HomeDTO = {
  network: { network_name: 'My Home', access_mode: 'local', user_role: 'primary' },
  favourites: { devices: ['d1', 'd6'], groups: ['g1'], zones: ['z1'], scenes: ['s1', 's2'], presets: ['p1'] },
  groups: [{ id: 'g1', name: 'All lights', device_ids: ['d1', 'd2', 'd6'] }],
  zones: [{ id: 'z1', name: 'Upstairs', device_ids: ['d4', 'd5'] }],
  scenes: [
    { id: 's1', name: 'Good night', actions: ['d1', 'd2', 'd3', 'd6'].map(device_id => ({ device_id, is_on: false })) },
    {
      id: 's2',
      name: 'Movie time',
      actions: [{ device_id: 'd1', is_on: false }, { device_id: 'd2', is_on: true }],
    },
  ],
  presets: [{ id: 'p1', name: 'Cool down', actions: [{ device_id: 'd4', is_on: true }] }],
}
