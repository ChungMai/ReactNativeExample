export type UserRole = 'primary' | 'secondary'

/** A network the user belongs to. Only remote access is supported. */
export interface JoinedNetwork {
  readonly id: string
  name: string
  role: UserRole
  remoteAccessEnabled: boolean
}

export interface NetworkList {
  joined: JoinedNetwork[]
  serverOnline: boolean
  /** false until the first answer (success or failure) from the server. */
  loaded: boolean
}

/** The network the user chose to work with. */
export type ActiveNetwork = Pick<JoinedNetwork, 'id' | 'name' | 'role'>
