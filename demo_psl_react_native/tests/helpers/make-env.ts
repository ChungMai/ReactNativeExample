// Builds a fresh set of repositories and use cases for each test, starting from the seed data.
import type { AppError } from '@/shared/domain/app-error'
import { CachedDeviceRepository } from '@/features/devices/data/cached-device-repository'
import { FakeDeviceApi } from '@/features/devices/data/sources/device-api'
import { InMemoryDeviceDb } from '@/features/devices/data/sources/device-db'
import { LoadDevicesUseCase } from '@/features/devices/domain/use-cases/load-devices'
import { GetAllDevicesUseCase } from '@/features/devices/domain/use-cases/get-all-devices'
import { SetDevicesPowerUseCase } from '@/features/devices/domain/use-cases/set-devices-power'
import { ToggleDeviceUseCase } from '@/features/devices/domain/use-cases/toggle-device'
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
  const setDevicesPower = new SetDevicesPowerUseCase(deviceRepository)
  return {
    deviceRepository,
    roomRepository,
    loadDevices: new LoadDevicesUseCase(deviceRepository),
    getAllDevices: new GetAllDevicesUseCase(deviceRepository),
    toggleDevice: new ToggleDeviceUseCase(deviceRepository),
    setDevicesPower,
    loadRooms: new LoadRoomsUseCase(roomRepository),
    getAllRooms: new GetAllRoomsUseCase(roomRepository),
    getRoomDetailInfo: new GetRoomDetailInfoUseCase(roomRepository),
    checkRoomName: new CheckRoomNameUseCase(),
    createRoom: new CreateRoomUseCase(roomRepository),
    deleteRoom: new DeleteRoomUseCase(roomRepository),
    updateRoomAttributes: new UpdateRoomAttributesUseCase(roomRepository),
    triggerRoom: new TriggerRoomUseCase(roomRepository, setDevicesPower),
  }
}
