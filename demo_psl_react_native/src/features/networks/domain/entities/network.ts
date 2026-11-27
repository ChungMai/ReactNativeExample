export type UserRole = 'primary' | 'secondary'
/** How the app can reach a network. `unknown` while it is still being checked. */
export type AccessMode = 'local' | 'remote' | 'troubleshoot' | 'unknown'

/** A network the user belongs to. */
export interface JoinedNetwork {
  readonly id: string
  name: string
  role: UserRole
  remoteAccessEnabled: boolean
  primaryUserCount: number
  mode: AccessMode
}

/** A network found nearby that the user has not joined. */
export interface NearbyNetwork {
  readonly id: string
  name: string
  requestPending: boolean
  onCurrentServer: boolean
}

export interface NetworkList {
  joined: JoinedNetwork[]
  nearby: NearbyNetwork[]
  serverOnline: boolean
  /** true when joining, deleting and leaving are not available. */
  readOnly: boolean
  /** false until the first answer (success or failure) from the server. */
  loaded: boolean
}

/** The network the user chose to work with. */
export type ActiveNetwork = Pick<JoinedNetwork, 'id' | 'name' | 'role' | 'mode'>
