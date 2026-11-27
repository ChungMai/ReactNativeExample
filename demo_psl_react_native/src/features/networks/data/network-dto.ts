export interface NetworkListDTO {
  joined: { network_id: string; network_name: string; user_role: 'primary' | 'secondary'; ras: boolean; primary_users: number }[]
  nearby: { network_id: string; network_name: string; request_status: 'pending' | null; same_server: boolean }[]
}
export type AccessDTO = 'local' | 'remote' | 'troubleshoot'
