export interface NetworkDTO {
  network_id: string
  network_name: string
  user_role: 'primary' | 'secondary'
  ras: boolean
}
