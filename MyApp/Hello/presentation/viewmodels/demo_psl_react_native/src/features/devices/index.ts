// Public API of the devices feature. Other features and `app/` may only import from here.
export type { Device, DeviceMap } from './domain/entities/device'
export type { SetDevicesPowerUseCase } from './domain/use-cases/set-devices-power'
export type { DeviceDisplay } from './presentation/shared/models/device-display'
export { toDeviceDisplay } from './presentation/shared/mappers/device-display-mapper'
// UI: ./presentation/index.native.ts on mobile, ./presentation/index.web.ts on web
export { DevicesScreen } from './presentation'
