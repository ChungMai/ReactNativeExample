// The server is faked; the shapes follow the Swift mapping of NetworkInfo and HomeInfo.
import { CachedHomeRepository } from '@/features/home/data/cached-home-repository'
import { CloudHomeApi } from '@/features/home/data/sources/cloud-home-api'
import { buildHomeOverview } from '@/features/home/domain/build-home-overview'

const DETAILS = {
  userProfile: {
    userRole: 'secondary',
    favourites: { devices: [1], rooms: [2], groups: [3], zones: [4], scenes: [5], presets: [6] },
  },
}
const OBJECTS = {
  '006A': [{ '0081': 1, '008A': 'Lamp', '0080': 512, '0100': 1 }],
  '0065': [{ '0081': 2, '008A': 'Hall', '006C': 768, '0100': false }, { '0081': 3, '008A': 'Lights', '006C': 512, '0100': true }],
  '0060': [{ '0081': 4, '008A': 'Upstairs' }],
  '0068': [{ '0081': 5, '008A': 'Night' }],
  '0066': [{ '0081': 6, '008A': 'Cool' }],
  '0100': { on: { '0064': 7, '0065.0300': 1, '0065.0200': 2, '0060': 0 } },
}
const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const network = () => ({ id: 'n1', hub: 'hub-1', name: 'My Lab' })
const server = () => jest.fn(async (url: any, _init?: RequestInit) =>
  ({ status: 200, json: async () => (String(url).includes('/objects') ? OBJECTS : DETAILS) }) as Response)

describe('CloudHomeApi', () => {
  it('reads the favourites, then their objects, and shows them with the server states', async () => {
    const request = server()
    const repository = new CachedHomeRepository(new CloudHomeApi(credentials, network, () => false, request))
    await repository.refresh()

    expect(request.mock.calls.map(c => c[0])).toEqual([
      'https://dev.example.test/app/networks/users/?networkName=My%20Lab&primaryHub=hub-1',
      'https://dev.example.test/api/bridge/hub-1/objects',
    ])
    expect(JSON.parse(request.mock.calls[1][1]?.body as string)).toMatchObject({
      '0010': 8, '0011': 17, '006A': [1], '0065': [2, 3], '0060': [4], '0066': [6], '0068': [5],
    })

    const { snapshot, readOnly } = repository.getState()
    expect(readOnly).toBe(true)
    const overview = buildHomeOverview({ snapshot, rooms: [], devices: {} })
    expect(overview.sections.map(s => [s.kind, s.items[0].name, s.items[0].isOn])).toEqual([
      ['scene', 'Night', undefined], ['device', 'Lamp', true], ['room', 'Hall', false],
      ['group', 'Lights', true], ['zone', 'Upstairs', undefined], ['preset', 'Cool', undefined],
    ])
    expect(overview.summary.map(s => s.count)).toEqual([7, 1, 2, 0])
  })

  it('shows nothing from the demo home when the server fails', async () => {
    const request = jest.fn(async () => ({ status: 502 }) as Response)
    const repository = new CachedHomeRepository(new CloudHomeApi(credentials, network, () => false, request))
    await expect(repository.refresh()).rejects.toMatchObject({ code: 'network' })
    expect(repository.getState()).toMatchObject({ serverOnline: false, snapshot: { favourites: { device: [] } } })
  })
})
