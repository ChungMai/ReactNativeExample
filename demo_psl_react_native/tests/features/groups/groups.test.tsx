// The server is faked; the shapes follow the Swift mapping of GroupInfo.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { ServerGroupList } from '@/features/groups/data/server-group-list'
import { CloudGroupApi } from '@/features/groups/data/sources/cloud-group-api'
import { GroupsScreen } from '@/features/groups/presentation/shared/screens/groups-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

const credentials = { server: () => 'https://dev.example.test', accessToken: async () => 'token-1' }
const network = () => ({ id: 'n1', hub: 'hub-1' })
const GROUPS = [
  { '0081': 1, '008A': 'Downlights', '006C': 512, '00C8': [512, 513], '0100': 1 },
  { '0081': 2, '008A': 'Shades', '006C': 512, '00C8': [1200, 1205] },
  { '0081': 3, '008A': 'Mixed', '006C': 512, '00C8': [512, 576], '0108': 0 },
  { '0081': 4, '008A': 'Relay lights', '006C': 512, '00C8': [560], '00C9': [5] },
  { '0081': 5, '008A': 'Screens', '006C': 512, '00C8': [1219] },
  { '0081': 6, '008A': 'A room', '006C': 768 },
]
const reply = jest.fn(async (_url: any) => ({ status: 200, json: async () => GROUPS }) as Response)
const api = () => new CloudGroupApi(credentials, network, () => false, reply)

it('asks for the groups and sorts them into categories', async () => {
  const groups = await api().fetchGroups()
  expect(reply).toHaveBeenCalledWith('https://dev.example.test/api/bridge/hub-1/groups', expect.objectContaining({ method: 'GET' }))
  expect(groups.map(g => [g.name, g.category, g.isOn])).toEqual([
    ['Downlights', 'Lighting', true], ['Shades', 'Curtain', undefined], ['Mixed', 'Others', false],
    ['Relay lights', 'Lighting', undefined], ['Screens', 'PanL Display', undefined],
  ])
})

it('shows the sections, which open to cards, and searches', async () => {
  Object.assign(container, { serverGroups: new ServerGroupList(api()) })
  const view = await render(<GroupsScreen />)

  await fireEvent.press(await screen.findByText('Lighting (2)'))
  // the grid draws its cards once it knows its width
  await fireEvent(screen.getByTestId('card-grid'), 'layout', { nativeEvent: { layout: { width: 390 } } })
  expect(screen.getByLabelText('Downlights, on')).toBeTruthy()
  expect(screen.queryByLabelText('Mixed, off')).toBeNull()

  await fireEvent.changeText(screen.getByLabelText('Search groups'), 'mix')
  for (const grid of screen.getAllByTestId('card-grid')) {
    await fireEvent(grid, 'layout', { nativeEvent: { layout: { width: 390 } } })
  }
  expect(screen.getByLabelText('Mixed, off')).toBeTruthy()
  await view.unmount() // stops the polling
})
