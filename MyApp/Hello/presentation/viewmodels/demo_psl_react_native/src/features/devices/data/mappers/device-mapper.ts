import type { Device, DeviceKind, DeviceMap } from '../../domain/entities/device'
import type { DeviceDTO } from '../dto/device-dto'

const KINDS: readonly DeviceKind[] = ['light', 'plug', 'fan', 'blind']
const toKind = (type: string): DeviceKind => (KINDS as readonly string[]).includes(type) ? (type as DeviceKind) : 'plug'

export const deviceToDomain = (dto: DeviceDTO): Device => ({
  id: dto.id, name: dto.name, kind: toKind(dto.type), on: dto.is_on,
})

export const deviceToDTO = (d: Device): DeviceDTO => ({
  id: d.id, name: d.name, type: d.kind, is_on: d.on,
})

export const devicesToMap = (dtos: DeviceDTO[]): DeviceMap =>
  Object.fromEntries(dtos.map(dto => [dto.id, deviceToDomain(dto)]))
