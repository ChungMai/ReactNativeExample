// The phone and the wide Home share one view model.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { CachedHomeRepository } from '@/features/home/data/cached-home-repository'
import type { HomeSnapshot } from '@/features/home/domain/entities/favourites'
import { GetHomeUseCase } from '@/features/home/domain/use-cases/get-home'
import { RefreshHomeUseCase } from '@/features/home/domain/use-cases/refresh-home'
import MobileHomeScreen from '@/features/home/presentation/mobile/screens/home-screen'
import WebHomeScreen from '@/features/home/presentation/web/screens/home-screen'
import { makeEnv } from '@tests/helpers/make-env'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

const SNAPSHOT: HomeSnapshot = {
  favourites: { device: ['1'], group: [], zone: [], scene: [], preset: [] },
  devices: { '1': { id: '1', name: 'Lamp', kind: 'light', on: true } },
  rooms: [{ id: '2', name: 'Hall', isOn: false }],
  groups: [], zones: [], scenes: [], presets: [],
  onCounts: { device: 1, room: 0, group: 0, zone: 0 },
}

beforeEach(() => {
  jest.clearAllMocks()
  const repository = new CachedHomeRepository({ source: () => 'test', fetchHome: async () => SNAPSHOT })
  Object.assign(container, makeEnv(), { getHome: new GetHomeUseCase(repository), refreshHome: new RefreshHomeUseCase(repository) })
})

describe.each([['mobile', MobileHomeScreen], ['web', WebHomeScreen]])('HomeScreen (%s)', (_name, HomeScreen) => {
  it('shows the favourites; a room opens, a device cannot be switched', async () => {
    const view = await render(<HomeScreen />)

    await fireEvent.press(await screen.findByRole('button', { name: 'Hall, off' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/room/[id]', params: { id: '2' } })

    await fireEvent.press(screen.getByRole('button', { name: 'Lamp, on' }))
    expect(screen.getByText(/read only/)).toBeTruthy()
    await view.unmount() // stops the polling
  })
})
