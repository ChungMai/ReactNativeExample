// The server is faked; the shapes follow the Swift mapping of RoomInfo.
import { ServerRoomList } from '@/features/rooms/data/server-room-list'
import { CloudRoomApi } from '@/features/rooms/data/sources/cloud-room-api'

const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const network = () => ({ id: 'n1', hub: 'hub-1' })
const ROOMS = [{ '0081': 2, '008A': 'Hall', '006C': 768, '0100': 1 }, { '0081': 3, '008A': 'Lights', '006C': 512 }]
const MEMBERS = {
  '0064': [{ '0081': 5, '008A': 'Lamp', '0100': 0, '0103': 1 }],
  '0066': [{ '0081': 7, '008A': 'Evening', '007F': 0 }, { '0081': 8, '008A': 'internal', '007F': 1 }],
}
const reply = (body: unknown) => ({ status: 200, json: async () => body }) as Response

describe('real rooms', () => {
  it('lists the rooms and loads the members of one', async () => {
    const request = jest.fn(async (url: any) => reply(String(url).endsWith('/memberof') ? MEMBERS : ROOMS))
    const list = new ServerRoomList(new CloudRoomApi(credentials, network, () => false, request))

    await list.refresh()
    await list.loadMembers('2')

    expect(request.mock.calls.map(c => c[0])).toEqual([
      'https://dev.example.test/api/bridge/hub-1/groups/0',
      'https://dev.example.test/api/bridge/hub-1/groups/2/memberof',
    ])
    expect(list.get().rooms).toEqual([{ id: '2', name: 'Hall', isOn: true }])
    expect(list.get().members['2']).toEqual({
      devices: [{ id: '5', name: 'Lamp', kind: 'plug', isOn: false, unreachable: true }],
      presets: [{ id: '7', name: 'Evening' }],
    })
  })

  it('records a failure to load the members', async () => {
    const request = jest.fn(async () => ({ status: 500 }) as Response)
    const list = new ServerRoomList(new CloudRoomApi(credentials, network, () => false, request))
    await list.loadMembers('2')
    expect(list.get().members['2']).toBe('error')
  })
})
