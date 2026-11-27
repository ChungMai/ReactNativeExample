// Builds a fresh set of repositories and use cases for each test, starting from the seed data.
import type { AppError } from '@/shared/domain/app-error'
import { SessionAuthRepository } from '@/features/auth/data/session-auth-repository'
import { DEMO_ACCOUNT, FakeAuthApi } from '@/features/auth/data/sources/auth-api'
import { InMemorySessionStore } from '@/features/auth/data/sources/session-store'
import { StoredServerRepository } from '@/features/auth/data/stored-server-repository'
import { ConnectServerUseCase } from '@/features/auth/domain/use-cases/connect-server'
import { GetServerSettingsUseCase } from '@/features/auth/domain/use-cases/get-server-settings'
import { RemoveServerUseCase } from '@/features/auth/domain/use-cases/remove-server'
import { GetSessionUseCase } from '@/features/auth/domain/use-cases/get-session'
import { LoginUseCase } from '@/features/auth/domain/use-cases/login'
import { LogoutUseCase } from '@/features/auth/domain/use-cases/logout'
import { RestoreSessionUseCase } from '@/features/auth/domain/use-cases/restore-session'
import { CachedDeviceRepository } from '@/features/devices/data/cached-device-repository'
import { FakeDeviceApi } from '@/features/devices/data/sources/device-api'
import { InMemoryDeviceDb } from '@/features/devices/data/sources/device-db'
import { LoadDevicesUseCase } from '@/features/devices/domain/use-cases/load-devices'
import { GetAllDevicesUseCase } from '@/features/devices/domain/use-cases/get-all-devices'
import { SetDevicesPowerUseCase } from '@/features/devices/domain/use-cases/set-devices-power'
import { ToggleDeviceUseCase } from '@/features/devices/domain/use-cases/toggle-device'
import { CachedHomeRepository } from '@/features/home/data/cached-home-repository'
import { FakeHomeApi } from '@/features/home/data/sources/home-api'
import { ActivateHomeItemUseCase } from '@/features/home/domain/use-cases/activate-home-item'
import { GetHomeUseCase } from '@/features/home/domain/use-cases/get-home'
import { RefreshHomeUseCase } from '@/features/home/domain/use-cases/refresh-home'
import { SaveFavouritesUseCase } from '@/features/home/domain/use-cases/save-favourites'
import { CachedNetworkRepository } from '@/features/networks/data/cached-network-repository'
import { FakeNetworkApi } from '@/features/networks/data/sources/network-api'
import { GetNetworksUseCase } from '@/features/networks/domain/use-cases/get-networks'
import { JoinNetworkUseCase } from '@/features/networks/domain/use-cases/join-network'
import { LeaveActiveNetworkUseCase } from '@/features/networks/domain/use-cases/leave-active-network'
import { RefreshNetworksUseCase } from '@/features/networks/domain/use-cases/refresh-networks'
import { RemoveNetworkUseCase } from '@/features/networks/domain/use-cases/remove-network'
import { SelectNetworkUseCase } from '@/features/networks/domain/use-cases/select-network'
import { CachedRoomRepository } from '@/features/rooms/data/cached-room-repository'
import { FakeRoomApi } from '@/features/rooms/data/sources/room-api'
import { InMemoryRoomDb } from '@/features/rooms/data/sources/room-db'
import { CheckRoomNameUseCase } from '@/features/rooms/domain/use-cases/check-room-name'
import { CreateRoomUseCase } from '@/features/rooms/domain/use-cases/create-room'
import { DeleteRoomUseCase } from '@/features/rooms/domain/use-cases/delete-room'
import { GetAllRoomsUseCase } from '@/features/rooms/domain/use-cases/get-all-rooms'
import { GetRoomDetailInfoUseCase } from '@/features/rooms/domain/use-cases/get-room-detail-info'
import { LoadRoomsUseCase } from '@/features/rooms/domain/use-cases/load-rooms'
import { TriggerRoomUseCase } from '@/features/rooms/domain/use-cases/trigger-room'
import { UpdateRoomAttributesUseCase } from '@/features/rooms/domain/use-cases/update-room-attributes'

/** Pass `apiError` to make both fake APIs fail, to test the error paths. */
export function makeEnv(options: { apiError?: AppError } = {}) {
  const deviceRepository = new CachedDeviceRepository(new FakeDeviceApi(options.apiError), new InMemoryDeviceDb())
  const roomRepository = new CachedRoomRepository(new FakeRoomApi(options.apiError), new InMemoryRoomDb())
  const authRepository = new SessionAuthRepository(new FakeAuthApi(options.apiError), new InMemorySessionStore())
  const networkApi = new FakeNetworkApi(options.apiError)
  const networkRepository = new CachedNetworkRepository(networkApi)
  const leaveActiveNetwork = new LeaveActiveNetworkUseCase(networkRepository)
  const verifyServer = jest.fn(async (_url: string) => {})
  let storedServers: string | null = null
  const serverRepository = new StoredServerRepository(
    { read: () => storedServers, write: value => { storedServers = value } }, verifyServer)
  const homeApi = new FakeHomeApi(options.apiError)
  const homeRepository = new CachedHomeRepository(homeApi)
  const setDevicesPower = new SetDevicesPowerUseCase(deviceRepository)
  const toggleDevice = new ToggleDeviceUseCase(deviceRepository)
  const loadDevices = new LoadDevicesUseCase(deviceRepository)
  const loadRooms = new LoadRoomsUseCase(roomRepository)
  const updateRoomAttributes = new UpdateRoomAttributesUseCase(roomRepository)
  const triggerRoom = new TriggerRoomUseCase(roomRepository, setDevicesPower)
  return {
    networkApi,
    networkRepository,
    getNetworks: new GetNetworksUseCase(networkRepository),
    refreshNetworks: new RefreshNetworksUseCase(networkRepository),
    selectNetwork: new SelectNetworkUseCase(networkRepository),
    joinNetwork: new JoinNetworkUseCase(networkRepository),
    removeNetwork: new RemoveNetworkUseCase(networkRepository),
    leaveActiveNetwork,
    demoAccount: DEMO_ACCOUNT,
    authRepository,
    verifyServer,
    getServerSettings: new GetServerSettingsUseCase(serverRepository),
    connectServer: new ConnectServerUseCase(serverRepository),
    removeServer: new RemoveServerUseCase(serverRepository),
    login: new LoginUseCase(authRepository),
    logout: new LogoutUseCase(authRepository),
    getSession: new GetSessionUseCase(authRepository),
    restoreSession: new RestoreSessionUseCase(authRepository),
    deviceRepository,
    roomRepository,
    homeRepository,
    homeApi,
    loadDevices,
    getAllDevices: new GetAllDevicesUseCase(deviceRepository),
    toggleDevice,
    setDevicesPower,
    loadRooms,
    getAllRooms: new GetAllRoomsUseCase(roomRepository),
    getRoomDetailInfo: new GetRoomDetailInfoUseCase(roomRepository),
    checkRoomName: new CheckRoomNameUseCase(),
    createRoom: new CreateRoomUseCase(roomRepository),
    deleteRoom: new DeleteRoomUseCase(roomRepository),
    updateRoomAttributes,
    triggerRoom,
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
}
