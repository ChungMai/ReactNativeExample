// The server is faked; the shapes follow the Swift mapping of DeviceInfo.
import { ServerDeviceList } from '@/features/devices/data/server-device-list'
import { CloudDeviceApi } from '@/features/devices/data/sources/cloud-device-api'
import { buildDeviceSections } from '@/features/devices/domain/build-device-sections'

const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const network = () => ({ id: 'n1', hub: 'hub-1' })
const lamp = (id: number) => ({ '0081': id, '008A': `Lamp ${id}`, '0080': 512, '0100': 1 })
const reply = (body: unknown) => ({ status: 200, json: async () => body }) as Response

describe('CloudDeviceApi', () => {
  it('reads page after page and maps the devices', async () => {
    const first = Array.from({ length: 64 }, (_, i) => lamp(i + 1))
    const second = [{ '0081': 100, '008A': 'Door', '0080': 960, '0100': 0, '0103': 1 }, { '0081': 101 }]
    const request = jest.fn(async (_url: any, init?: RequestInit) =>
      reply(JSON.parse(init?.body as string)['00C6'] === 0 ? first : second))

    const devices = await new CloudDeviceApi(credentials, network, () => false, request).fetchDevices()

    expect(request.mock.calls.map(c => [c[0], JSON.parse(c[1]?.body as string)])).toEqual([
      ['https://dev.example.test/api/bridge/hub-1/accessories', { '0010': 23, '00C5': 64, '00C6': 0 }],
      ['https://dev.example.test/api/bridge/hub-1/accessories', { '0010': 23, '00C5': 128, '00C6': 64 }],
    ])
    expect(devices).toHaveLength(65)
    expect(devices[64]).toEqual({ id: '100', name: 'Door', category: 'Sensor', isOn: undefined, unreachable: true })
    expect(buildDeviceSections(devices, 'lamp 1', false).map(s => [s.category, s.devices[0].name]))
      .toEqual([['Lighting', 'Lamp 19']])
  })

  it('keeps the last list when a refresh fails, and drops it for another network', async () => {
    let source = 'a'
    const fetchDevices = jest.fn(async () => [{ id: '1', name: 'Lamp', category: 'Lighting' as const, unreachable: false }])
    const list = new ServerDeviceList({ source: () => source, fetchDevices })
    await list.refresh()
    fetchDevices.mockRejectedValue(new Error('down'))

    await expect(list.refresh()).rejects.toMatchObject({ code: 'unknown' })
    expect(list.get()).toMatchObject({ serverOnline: false, devices: [{ name: 'Lamp' }] })

    source = 'b'
    await expect(list.refresh()).rejects.toBeDefined()
    expect(list.get().devices).toEqual([])
  })
})
