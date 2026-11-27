// Swift: doQuickAction. Tapping a card switches it or triggers it.
import type { DeviceMap } from '../../../devices'
import { AppError } from '../../../../shared/domain/app-error'
import { assertNever } from '../../../../shared/domain/assert-never'
import type { HomeItem } from '../entities/home-overview'
import type { HomeRepository } from '../repositories/home-repository'

/** What Home needs from the devices and rooms features (wired in src/di). */
export interface HomeControls {
  getDevices(): DeviceMap
  getRoomDeviceIds(roomId: string): string[]
  toggleDevice(id: string): void
  setDevicesPower(ids: string[], on: boolean): void
  triggerRoom(id: string, on: boolean): void
}

export class ActivateHomeItemUseCase {
  constructor(private repository: HomeRepository, private controls: HomeControls) {}

  /** Throws an AppError when the server is offline. */
  execute(item: Pick<HomeItem, 'kind' | 'id'>): void {
    const { snapshot, serverOnline } = this.repository.getState()
    if (!serverOnline) throw new AppError('network', 'Server unreachable')

    const { kind, id } = item
    switch (kind) {
      case 'device':
        return this.controls.toggleDevice(id)
      case 'room':
        return this.controls.triggerRoom(id, !this.isRoomOn(id))
      case 'group':
      case 'zone': {
        const target = (kind === 'group' ? snapshot.groups : snapshot.zones).find(c => c.id === id)
        if (!target) return
        const devices = this.controls.getDevices()
        const on = target.deviceIds.some(d => devices[d]?.on)
        return this.controls.setDevicesPower(target.deviceIds, !on)
      }
      case 'scene':
      case 'preset': {
        const scene = (kind === 'scene' ? snapshot.scenes : snapshot.presets).find(s => s.id === id)
        if (!scene) return
        for (const on of [true, false]) {
          const ids = Object.keys(scene.states).filter(d => scene.states[d] === on)
          if (ids.length > 0) this.controls.setDevicesPower(ids, on)
        }
        return
      }
      default:
        return assertNever(kind)
    }
  }

  private isRoomOn(id: string): boolean {
    const devices = this.controls.getDevices()
    return this.controls.getRoomDeviceIds(id).some(d => devices[d]?.on)
  }
}
