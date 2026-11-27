import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import NetworkListScreen from '@/features/networks/presentation/shared/screens/network-list-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

let env: ReturnType<typeof makeEnv>
beforeEach(() => {
  env = makeEnv()
  Object.assign(container, env, { logout: { execute: jest.fn() } })
})

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }))

describe('NetworkListScreen', () => {
  it('lists the networks and chooses one', async () => {
    await render(<NetworkListScreen />)
    await press('Lab')
    expect(env.getNetworks.active()?.id).toBe('n1')
  })

  it('explains why a network cannot be opened', async () => {
    await render(<NetworkListScreen />)
    await press('Office')
    expect(screen.getByText('Permission Denied')).toBeTruthy()
    await press('OK')
    expect(screen.queryByText('Permission Denied')).toBeNull()
  })
})
