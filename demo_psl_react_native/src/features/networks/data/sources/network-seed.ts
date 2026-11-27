// Demo data: one network for each way selecting it can go.
import type { AccessDTO, NetworkListDTO } from '../network-dto'

export const NETWORK_SEED: NetworkListDTO = {
  joined: [
    { network_id: 'n1', network_name: 'My Home', user_role: 'primary', ras: true, primary_users: 1 },
    { network_id: 'n2', network_name: 'Beach House', user_role: 'secondary', ras: true, primary_users: 1 },
    { network_id: 'n3', network_name: 'Office', user_role: 'primary', ras: false, primary_users: 2 },
    { network_id: 'n4', network_name: 'Garage', user_role: 'primary', ras: true, primary_users: 1 },
  ],
  nearby: [
    { network_id: 'n5', network_name: 'Neighbour', request_status: null, same_server: true },
    { network_id: 'n6', network_name: 'Showroom', request_status: null, same_server: false },
  ],
}

export const ACCESS_SEED: Record<string, AccessDTO> = { n1: 'local', n2: 'remote', n3: 'remote', n4: 'troubleshoot' }
