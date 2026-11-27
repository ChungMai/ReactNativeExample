// Hourly energy of one meter. Swift: PSLBarChartDataHandler and PSLEnergyUsagesInfo.
import { createAuthorizedFetch, type Credentials } from '../../../shared/data/authorized-fetch'
import { AppError } from '../../../shared/domain/app-error'
import type { EnergyDay } from '../domain/energy'

const SAFE_ID = /^[A-Za-z0-9_-]+$/ // it becomes part of the path
const HOUR = 3600

export class CloudEnergyApi {
  private call: ReturnType<typeof createAuthorizedFetch>

  constructor(
    credentials: Credentials,
    private network: () => { id: string } | undefined,
    onUnauthorized: (error: unknown) => boolean,
    request?: typeof fetch,
  ) {
    this.call = createAuthorizedFetch(credentials, onUnauthorized, request)
  }

  async fetchDay(meterId: string, day: Date): Promise<EnergyDay> {
    const network = this.network()
    if (!network || !SAFE_ID.test(network.id) || !/^\d+$/.test(meterId)) throw new AppError('unknown', 'No meter is chosen')
    const two = (n: number) => String(n).padStart(2, '0')
    const date = `${two(day.getDate())}-${two(day.getMonth() + 1)}-${day.getFullYear()}`
    const query = `totalDeviceId=${meterId}&interval=${HOUR}&devices=${encodeURIComponent(JSON.stringify([meterId]))}`

    const answer: any = await this.call(`/ec/api/${network.id}/energy-meter/date/${date}?${query}`)
    const devices: any[] = Array.isArray(answer.devices) ? answer.devices : []
    const meter = devices.find(d => String(d?.deviceId) === meterId)
    const intervals: any[] = meter?.intervals ?? meter?.interval ?? []
    const total = answer.currentUsage
    return {
      timeZone: typeof answer.timezone === 'string' ? answer.timezone : undefined,
      total: typeof total === 'number' && total >= 0 ? total : undefined,
      hours: intervals
        .filter(i => typeof i?.time === 'number')
        // -1: data is missing, -2: not collected yet
        .map(i => ({ time: i.time, kwh: typeof i.activePower === 'number' && i.activePower >= 0 ? i.activePower : undefined })),
    }
  }
}
