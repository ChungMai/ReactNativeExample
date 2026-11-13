import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import RoomsScreen from '@/features/rooms/presentation/screens/rooms-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
}))

describe('RoomsScreen loading and error states', () => {
  it('shows a loading indicator while the rooms are being loaded', async () => {
    const env = makeEnv()
    let finish!: () => void
    jest.spyOn(env.roomRepository, 'refresh').mockReturnValue(new Promise<void>(r => { finish = r }))
    Object.assign(container, env)

    await render(<RoomsScreen />)
    expect(screen.getByRole('progressbar', { name: 'Loading rooms' })).toBeTruthy()
    expect(screen.queryByText('Bedroom')).toBeNull()

    finish()
    await waitFor(() => expect(screen.getByText('Bedroom')).toBeTruthy())
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('shows the error with a Retry button, and the list again after a successful retry', async () => {
    const env = makeEnv()
    jest.spyOn(env.roomRepository, 'refresh').mockRejectedValueOnce(new AppError('network', 'down'))
    Object.assign(container, env)

    await render(<RoomsScreen />)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No connection. Check your network and try again.'))
    expect(screen.queryByText('Bedroom')).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getByText('Bedroom')).toBeTruthy())
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('keeps the header while loading or failing', async () => {
    Object.assign(container, makeEnv({ apiError: new AppError('timeout', 't') }))
    await render(<RoomsScreen />)
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByText('Rooms')).toBeTruthy()
  })
})
