// Composition root: the only place that knows concrete implementations.
import { SessionAuthRepository } from '../features/auth/data/session-auth-repository'
import { AccessTokenProvider, SessionExpiredError } from '../features/auth/data/sources/access-token-provider'
import { fetchCognitoPool } from '../features/auth/data/sources/auth-server'
import { CognitoAuthApi } from '../features/auth/data/sources/cognito-auth-api'
import { refreshTokenStorage, secureStorage, serverStorage, tokenOwnerStorage } from '../features/auth/data/sources/secure-storage'
import { SelectedServerAuthApi } from '../features/auth/data/sources/selected-server-auth-api'
import { PersistentSessionStore } from '../features/auth/data/sources/session-store'
import { TokenVault } from '../features/auth/data/sources/token-vault'
import { StoredServerRepository } from '../features/auth/data/stored-server-repository'
import { ConnectServerUseCase } from '../features/auth/domain/use-cases/connect-server'
import { GetServerSettingsUseCase } from '../features/auth/domain/use-cases/get-server-settings'
import { GetSessionUseCase } from '../features/auth/domain/use-cases/get-session'
import { LoginUseCase } from '../features/auth/domain/use-cases/login'
import { LogoutUseCase } from '../features/auth/domain/use-cases/logout'
import { RemoveServerUseCase } from '../features/auth/domain/use-cases/remove-server'
import { RestoreSessionUseCase } from '../features/auth/domain/use-cases/restore-session'
import { ServerDeviceList } from '../features/devices/data/server-device-list'
import { CloudDeviceApi } from '../features/devices/data/sources/cloud-device-api'
import { ServerGroupList } from '../features/groups/data/server-group-list'
import { CloudGroupApi } from '../features/groups/data/sources/cloud-group-api'
import { CachedHomeRepository } from '../features/home/data/cached-home-repository'
import { CloudHomeApi } from '../features/home/data/sources/cloud-home-api'
import { GetHomeUseCase } from '../features/home/domain/use-cases/get-home'
import { RefreshHomeUseCase } from '../features/home/domain/use-cases/refresh-home'
import { CloudMoreApi } from '../features/more/data/cloud-more-api'
import { CloudEnergyApi } from '../features/more/data/energy-api'
import { ServerObjectLists } from '../features/more/data/server-object-lists'
import { CachedNetworkRepository } from '../features/networks/data/cached-network-repository'
import { CloudNetworkApi } from '../features/networks/data/sources/cloud-network-api'
import { GetNetworksUseCase } from '../features/networks/domain/use-cases/get-networks'
import { LeaveActiveNetworkUseCase } from '../features/networks/domain/use-cases/leave-active-network'
import { RefreshNetworksUseCase } from '../features/networks/domain/use-cases/refresh-networks'
import { SelectNetworkUseCase } from '../features/networks/domain/use-cases/select-network'
import { ServerRoomList } from '../features/rooms/data/server-room-list'
import { CloudRoomApi } from '../features/rooms/data/sources/cloud-room-api'
import { serverFetch } from '../shared/data/server-fetch'

// ---------- auth ----------
// The default server comes from .env.local (not committed). Without it, a server is chosen on the login screen.
const defaultServer = process.env.EXPO_PUBLIC_AUTH_SERVER_URL
const serverRepository = new StoredServerRepository(serverStorage, async url => { await fetchCognitoPool(url, serverFetch) })
const tokenVault = new TokenVault(tokenOwnerStorage, refreshTokenStorage)
const credentials = new AccessTokenProvider(tokenVault)
const authApi = new SelectedServerAuthApi(
  serverRepository.get,
  defaultServer,
  url => new CognitoAuthApi(url, serverFetch, undefined, tokens => tokenVault.save(tokens)),
  () => tokenVault.clear(),
)
const sessionStore = new PersistentSessionStore(secureStorage)
const authRepository = new SessionAuthRepository(authApi, sessionStore, () => tokenVault.clear())
// A sign-in without its tokens (e.g. on web after a reload) cannot call the server: start over.
if (authRepository.getSession() && !tokenVault.get()) authRepository.clearSession()
// Drop an expired session before the first screen is drawn (Swift: the splash screen's auto login).
new RestoreSessionUseCase(authRepository).execute()
// The server rejected the sign-in: back to the login screen. Returns true when that was the case.
const signOutIfExpired = (error: unknown) => {
  if (error !== undefined && !(error instanceof SessionExpiredError)) return false
  logout.execute()
  return true
}

// ---------- networks ----------
const cloudNetworks = new CloudNetworkApi(credentials, signOutIfExpired, serverFetch)
const networkRepository: CachedNetworkRepository = new CachedNetworkRepository(cloudNetworks)
const logoutSession = new LogoutUseCase(authRepository)
// signing out also forgets the user's networks
const logout = { execute: () => { networkRepository.reset(); logoutSession.execute() } }

// ---------- the chosen network ----------
const chosenNetwork = () => {
  const id = networkRepository.getActive()?.id
  const found = id ? cloudNetworks.hubOf(id) : undefined
  return id && found ? { id, ...found } : undefined
}
const homeRepository = new CachedHomeRepository(new CloudHomeApi(credentials, chosenNetwork, signOutIfExpired, serverFetch))
const serverDevices = new ServerDeviceList(new CloudDeviceApi(credentials, chosenNetwork, signOutIfExpired, serverFetch))
const serverRooms = new ServerRoomList(new CloudRoomApi(credentials, chosenNetwork, signOutIfExpired, serverFetch))
const serverGroups = new ServerGroupList(new CloudGroupApi(credentials, chosenNetwork, signOutIfExpired, serverFetch))
const moreNetwork = () => {
  const network = chosenNetwork()
  const role = networkRepository.getActive()?.role
  return network && role ? { ...network, role } : undefined
}
const moreApi = new CloudMoreApi(credentials, moreNetwork, signOutIfExpired, serverFetch)
const moreLists = new ServerObjectLists(moreApi)
const energyApi = new CloudEnergyApi(credentials, chosenNetwork, signOutIfExpired, serverFetch)
const meterInsights = {
  meters: () => moreApi.energyMeters(),
  day: (meterId: string, day: Date) => energyApi.fetchDay(meterId, day),
}

export const container = {
  // auth
  hasDefaultServer: Boolean(defaultServer),
  getServerSettings: new GetServerSettingsUseCase(serverRepository),
  connectServer: new ConnectServerUseCase(serverRepository),
  removeServer: new RemoveServerUseCase(serverRepository),
  login: new LoginUseCase(authRepository),
  logout,
  getSession: new GetSessionUseCase(authRepository),
  // networks
  getNetworks: new GetNetworksUseCase(networkRepository),
  refreshNetworks: new RefreshNetworksUseCase(networkRepository),
  selectNetwork: new SelectNetworkUseCase(networkRepository),
  leaveActiveNetwork: new LeaveActiveNetworkUseCase(networkRepository),
  // the chosen network
  getHome: new GetHomeUseCase(homeRepository),
  refreshHome: new RefreshHomeUseCase(homeRepository),
  serverDevices,
  serverRooms,
  serverGroups,
  moreLists,
  meterInsights,
}
