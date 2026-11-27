// The server is faked.
import { render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { CloudMoreApi } from '@/features/more/data/cloud-more-api'
import { CloudEnergyApi } from '@/features/more/data/energy-api'
import { ServerObjectLists } from '@/features/more/data/server-object-lists'
import MoreSectionScreen from '@/features/more/presentation/shared/screens/more-section-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({
  ...jest.requireActual('@tests/helpers/mock-home-router'),
  useLocalSearchParams: () => ({ section: 'scenes' }),
}))

const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const SCENES = [{ '0081': 2, '008A': 'Night' }, { '0081': 1, '008A': 'Dinner' }, { '0081': 3, '008A': 'internal', '007F': true }]
const NETWORK = { id: 'n1', hub: 'hub-1', name: 'Lab', role: 'primary' as const }
const answering = (body: unknown) => jest.fn(async (_url: any, _init?: RequestInit) => ({ status: 200, json: async () => body }) as Response)
const moreWith = (request: ReturnType<typeof answering>) => new CloudMoreApi(credentials, () => NETWORK, () => false, request)
const reply = jest.fn(async (_url: any) => ({ status: 200, json: async () => SCENES }) as Response)
const api = new CloudMoreApi(credentials, () => NETWORK, () => false, reply)

it('reads a list, without the entries the app made for itself, sorted by name', async () => {
  expect((await api.fetchObjects('scenes')).map(o => o.name)).toEqual(['Dinner', 'Night'])
  expect(reply).toHaveBeenCalledWith('https://dev.example.test/api/bridge/hub-1/scenes', expect.anything())
})

it('shows the list on its page', async () => {
  Object.assign(container, { moreLists: new ServerObjectLists(api) })
  await render(<MoreSectionScreen />)
  expect(await screen.findByLabelText('Search scenes')).toBeTruthy()
})

it('asks for the users with the network only', async () => {
  const request = answering([{ _id: 'u1', userRole: 'secondary', ras: true, user: { email: 'a@b.co', userName: 'Ann' } }])
  expect(await moreWith(request).fetchObjects('users'))
    .toEqual([{ id: 'u1', name: 'Ann', detail: 'a@b.co · Secondary · Remote access' }])
  expect(request.mock.calls[0][0]).toBe('https://dev.example.test/app/networks/users/all')
  expect(JSON.parse(request.mock.calls[0][1]?.body as string)).toEqual({ network: { networkName: 'Lab', primaryHub: 'hub-1' } })
})

it('takes the accessories and the network information from the hub list', async () => {
  const request = answering([
    { '0081': 1, '008A': 'Main hub', '0080': 257, '2415': 'primary', '008C': 'hub-1', '2413': 'Asia/Singapore' },
    { '0081': 2, '008A': 'Relay box', '0080': 265, '0103': 1 },
  ])
  expect(await moreWith(request).fetchObjects('accessories')).toEqual([{ id: '2', name: 'Relay box', note: 'Unreachable' }])
  const info = await moreWith(request).fetchObjects('network-settings')
  expect(info.map(r => r.detail)).toEqual(['Lab', 'n1', 'Primary user', 'Asia/Singapore', '1 (1 primary and 0 secondary)'])
})

it('reads the hours of one day, leaving missing ones empty', async () => {
  const request = answering({
    currentUsage: 1.5, timezone: 'Asia/Singapore',
    devices: [{ deviceId: '5', intervals: [{ time: 3600, activePower: 0.5 }, { time: 7200, activePower: -1 }] }],
  })
  const day = await new CloudEnergyApi(credentials, () => NETWORK, () => false, request).fetchDay('5', new Date(2026, 1, 3))
  expect(request.mock.calls[0][0]).toBe(
    'https://dev.example.test/ec/api/n1/energy-meter/date/03-02-2026?totalDeviceId=5&interval=3600&devices=%5B%225%22%5D')
  expect(day).toEqual({ total: 1.5, timeZone: 'Asia/Singapore', hours: [{ time: 3600, kwh: 0.5 }, { time: 7200, kwh: undefined }] })
})
