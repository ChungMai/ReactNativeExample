// A fresh set of repositories and use cases for each test. No server is contacted: the sources are stand-ins.
import { SessionAuthRepository } from '@/features/auth/data/session-auth-repository'
import { InMemorySessionStore } from '@/features/auth/data/sources/session-store'
import { StoredServerRepository } from '@/features/auth/data/stored-server-repository'
import { ConnectServerUseCase } from '@/features/auth/domain/use-cases/connect-server'
import { GetServerSettingsUseCase } from '@/features/auth/domain/use-cases/get-server-settings'
import { GetSessionUseCase } from '@/features/auth/domain/use-cases/get-session'
import { LoginUseCase } from '@/features/auth/domain/use-cases/login'
import { LogoutUseCase } from '@/features/auth/domain/use-cases/logout'
import { RemoveServerUseCase } from '@/features/auth/domain/use-cases/remove-server'
import { CachedNetworkRepository } from '@/features/networks/data/cached-network-repository'
import type { NetworkDTO } from '@/features/networks/data/network-dto'
import { GetNetworksUseCase } from '@/features/networks/domain/use-cases/get-networks'
import { LeaveActiveNetworkUseCase } from '@/features/networks/domain/use-cases/leave-active-network'
import { RefreshNetworksUseCase } from '@/features/networks/domain/use-cases/refresh-networks'
import { SelectNetworkUseCase } from '@/features/networks/domain/use-cases/select-network'
import type { AppError } from '@/shared/domain/app-error'

export const ACCOUNT = { email: 'user@example.com', password: 'made-up-password' }

export const NETWORKS: NetworkDTO[] = [
  { network_id: 'n1', network_name: 'Lab', user_role: 'primary', ras: true },
  { network_id: 'n2', network_name: 'Office', user_role: 'secondary', ras: false },
]

/** Pass `apiError` to make signing in and listing networks fail. */
export function makeEnv(options: { apiError?: AppError } = {}) {
  const authApi = {
    signIn: async (email: string, password: string) => {
      if (options.apiError) throw options.apiError
      return email === ACCOUNT.email && password === ACCOUNT.password
    },
  }
  const authRepository = new SessionAuthRepository(authApi, new InMemorySessionStore())
  const networkApi = {
    failWith: options.apiError as AppError | undefined,
    async fetchNetworks() {
      if (this.failWith) throw this.failWith
      return NETWORKS
    },
  }
  const networkRepository = new CachedNetworkRepository(networkApi)
  const verifyServer = jest.fn(async (_url: string) => {})
  let storedServers: string | null = null
  const serverRepository = new StoredServerRepository(
    { read: () => storedServers, write: value => { storedServers = value } }, verifyServer)

  return {
    hasDefaultServer: true,
    authRepository,
    verifyServer,
    getServerSettings: new GetServerSettingsUseCase(serverRepository),
    connectServer: new ConnectServerUseCase(serverRepository),
    removeServer: new RemoveServerUseCase(serverRepository),
    login: new LoginUseCase(authRepository),
    logout: new LogoutUseCase(authRepository),
    getSession: new GetSessionUseCase(authRepository),
    networkApi,
    getNetworks: new GetNetworksUseCase(networkRepository),
    refreshNetworks: new RefreshNetworksUseCase(networkRepository),
    selectNetwork: new SelectNetworkUseCase(networkRepository),
    leaveActiveNetwork: new LeaveActiveNetworkUseCase(networkRepository),
  }
}
