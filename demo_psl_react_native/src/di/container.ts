// Composition root: the only place that knows concrete implementations.
import { SessionAuthRepository } from '../features/auth/data/session-auth-repository'
import { DEMO_ACCOUNT, FakeAuthApi } from '../features/auth/data/sources/auth-api'
import { CognitoAuthApi } from '../features/auth/data/sources/cognito-auth-api'
import { fetchCognitoPool } from '../features/auth/data/sources/auth-server'
import { AccessTokenProvider, SessionExpiredError } from '../features/auth/data/sources/access-token-provider'
import { refreshTokenStorage, secureStorage, serverStorage, tokenOwnerStorage } from '../features/auth/data/sources/secure-storage'
import { TokenVault } from '../features/auth/data/sources/token-vault'
import { CloudNetworkApi } from '../features/networks/data/sources/cloud-network-api'
import { SwitchingNetworkApi } from '../features/networks/data/sources/switching-network-api'
import { SelectedServerAuthApi } from '../features/auth/data/sources/selected-server-auth-api'
import { StoredServerRepository } from '../features/auth/data/stored-server-repository'
import { ConnectServerUseCase } from '../features/auth/domain/use-cases/connect-server'
import { GetServerSettingsUseCase } from '../features/auth/domain/use-cases/get-server-settings'
import { RemoveServerUseCase } from '../features/auth/domain/use-cases/remove-server'
import { PersistentSessionStore } from '../features/auth/data/sources/session-store'
import { GetSessionUseCase } from '../features/auth/domain/use-cases/get-session'
import { LoginUseCase } from '../features/auth/domain/use-cases/login'
import { LogoutUseCase } from '../features/auth/domain/use-cases/logout'
import { RestoreSessionUseCase } from '../features/auth/domain/use-cases/restore-session'
import { serverFetch } from '../shared/data/server-fetch'
import { CachedDeviceRepository } from '../features/devices/data/cached-device-repository'
import { FakeDeviceApi } from '../features/devices/data/sources/device-api'
import { InMemoryDeviceDb } from '../features/devices/data/sources/device-db'
import { LoadDevicesUseCase } from '../features/devices/domain/use-cases/load-devices'
import { GetAllDevicesUseCase } from '../features/devices/domain/use-cases/get-all-devices'
import { SetDevicesPowerUseCase } from '../features/devices/domain/use-cases/set-devices-power'
import { ToggleDeviceUseCase } from '../features/devices/domain/use-cases/toggle-device'
import { CachedHomeRepository } from '../features/home/data/cached-home-repository'
import { FakeHomeApi } from '../features/home/data/sources/home-api'
import { ActivateHomeItemUseCase } from '../features/home/domain/use-cases/activate-home-item'
import { GetHomeUseCase } from '../features/home/domain/use-cases/get-home'
import { RefreshHomeUseCase } from '../features/home/domain/use-cases/refresh-home'
import { SaveFavouritesUseCase } from '../features/home/domain/use-cases/save-favourites'
import { CachedNetworkRepository } from '../features/networks/data/cached-network-repository'
import { FakeNetworkApi } from '../features/networks/data/sources/network-api'
import { GetNetworksUseCase } from '../features/networks/domain/use-cases/get-networks'
import { JoinNetworkUseCase } from '../features/networks/domain/use-cases/join-network'
import { LeaveActiveNetworkUseCase } from '../features/networks/domain/use-cases/leave-active-network'
import { RefreshNetworksUseCase } from '../features/networks/domain/use-cases/refresh-networks'
import { RemoveNetworkUseCase } from '../features/networks/domain/use-cases/remove-network'
import { SelectNetworkUseCase } from '../features/networks/domain/use-cases/select-network'
import { CachedRoomRepository } from '../features/rooms/data/cached-room-repository'
import { FakeRoomApi } from '../features/rooms/data/sources/room-api'
import { InMemoryRoomDb } from '../features/rooms/data/sources/room-db'
import { CheckRoomNameUseCase } from '../features/rooms/domain/use-cases/check-room-name'
import { CreateRoomUseCase } from '../features/rooms/domain/use-cases/create-room'
import { DeleteRoomUseCase } from '../features/rooms/domain/use-cases/delete-room'
import { GetAllRoomsUseCase } from '../features/rooms/domain/use-cases/get-all-rooms'
import { GetRoomDetailInfoUseCase } from '../features/rooms/domain/use-cases/get-room-detail-info'
import { LoadRoomsUseCase } from '../features/rooms/domain/use-cases/load-rooms'
import { TriggerRoomUseCase } from '../features/rooms/domain/use-cases/trigger-room'
import { UpdateRoomAttributesUseCase } from '../features/rooms/domain/use-cases/update-room-attributes'

const deviceRepository = new CachedDeviceRepository(new FakeDeviceApi(), new InMemoryDeviceDb())
const roomRepository = new CachedRoomRepository(new FakeRoomApi(), new InMemoryRoomDb())

// The default server comes from .env.local (not committed). Without it, the default is the demo account;
// other servers can still be chosen on the login screen.
const defaultServer = process.env.EXPO_PUBLIC_AUTH_SERVER_URL
const serverRepository = new StoredServerRepository(serverStorage, async url => { await fetchCognitoPool(url, serverFetch) })
const tokenVault = new TokenVault(tokenOwnerStorage, refreshTokenStorage)
const credentials = new AccessTokenProvider(tokenVault)
const authApi = new SelectedServerAuthApi(
  serverRepository.get,
  defaultServer,
  url => new CognitoAuthApi(url, serverFetch, undefined, tokens => tokenVault.save(tokens)),
  new FakeAuthApi(),
  () => tokenVault.clear(),
)
const sessionStore = new PersistentSessionStore(secureStorage)
const authRepository = new SessionAuthRepository(authApi, sessionStore, () => tokenVault.clear())
// A real sign-in without its tokens (e.g. on web after a reload) cannot call the server: start over.
const restoredEmail = authRepository.getSession()?.email
if (restoredEmail && restoredEmail !== DEMO_ACCOUNT.email && !tokenVault.get()) authRepository.clearSession()
// Drop an expired session before the first screen is drawn (Swift: the splash screen's auto login).
const restoreSession = new RestoreSessionUseCase(authRepository)
restoreSession.execute()
// The server rejected the sign-in: back to the login screen. Returns true when that was the case.
const signOutIfExpired = (error: unknown) => {
  if (error !== undefined && !(error instanceof SessionExpiredError)) return false
  logout.execute()
  return true
}
const networkRepository: CachedNetworkRepository = new CachedNetworkRepository(new SwitchingNetworkApi(
  () => credentials.server() !== undefined,
  new CloudNetworkApi(credentials, signOutIfExpired, serverFetch),
  new FakeNetworkApi(),
))
const leaveActiveNetwork = new LeaveActiveNetworkUseCase(networkRepository)
const logoutSession = new LogoutUseCase(authRepository)
const homeRepository = new CachedHomeRepository(new FakeHomeApi())

const setDevicesPower = new SetDevicesPowerUseCase(deviceRepository)
const toggleDevice = new ToggleDeviceUseCase(deviceRepository)
const loadDevices = new LoadDevicesUseCase(deviceRepository)
const loadRooms = new LoadRoomsUseCase(roomRepository)
const updateRoomAttributes = new UpdateRoomAttributesUseCase(roomRepository)
const triggerRoom = new TriggerRoomUseCase(roomRepository, setDevicesPower)

// signing out also forgets the user's networks
const logout = { execute: () => { networkRepository.reset(); logoutSession.execute() } }

export const container = {
  // auth
  demoAccount: defaultServer ? undefined : DEMO_ACCOUNT, // shown while the default server is selected
  getServerSettings: new GetServerSettingsUseCase(serverRepository),
  connectServer: new ConnectServerUseCase(serverRepository),
  removeServer: new RemoveServerUseCase(serverRepository),
  login: new LoginUseCase(authRepository),
  // signing out also forgets the chosen network
  logout,
  getSession: new GetSessionUseCase(authRepository),
  // devices
  loadDevices,
  getAllDevices: new GetAllDevicesUseCase(deviceRepository),
  toggleDevice,
  setDevicesPower,
  // rooms
  loadRooms,
  getAllRooms: new GetAllRoomsUseCase(roomRepository),
  getRoomDetailInfo: new GetRoomDetailInfoUseCase(roomRepository),
  checkRoomName: new CheckRoomNameUseCase(),
  createRoom: new CreateRoomUseCase(roomRepository),
  deleteRoom: new DeleteRoomUseCase(roomRepository),
  updateRoomAttributes,
  triggerRoom,
  // networks
  getNetworks: new GetNetworksUseCase(networkRepository),
  refreshNetworks: new RefreshNetworksUseCase(networkRepository),
  selectNetwork: new SelectNetworkUseCase(networkRepository),
  joinNetwork: new JoinNetworkUseCase(networkRepository),
  removeNetwork: new RemoveNetworkUseCase(networkRepository),
  leaveActiveNetwork,
  // home
  getHome: new GetHomeUseCase(homeRepository),
  refreshHome: new RefreshHomeUseCase(homeRepository, [loadRooms, loadDevices]),
  activateHomeItem: new ActivateHomeItemUseCase(homeRepository, {
    getDevices: deviceRepository.getAll,
    getRoomDeviceIds: id => roomRepository.getAll().find(r => r.id === id)?.deviceIds ?? [],
    toggleDevice: id => toggleDevice.execute(id),
    setDevicesPower: (ids, on) => setDevicesPower.execute(ids, on),
    triggerRoom: (id, on) => triggerRoom.execute(id, on),
  }),
  saveFavourites: new SaveFavouritesUseCase(homeRepository, {
    getRooms: roomRepository.getAll,
    setFavourite: (id, favourite) => updateRoomAttributes.execute(id, { favourite }),
  }),
}
