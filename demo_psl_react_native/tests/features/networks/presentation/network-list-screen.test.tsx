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
  it('lists joined and nearby networks', async () => {
    await render(<NetworkListScreen />)
    expect(await screen.findByRole('button', { name: 'My Home, Local Access' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Neighbour, JOIN' })).toBeTruthy()
  })

  it('chooses a network', async () => {
    await render(<NetworkListScreen />)
    await press('My Home, Local Access')
    expect(env.getNetworks.active()?.id).toBe('n1')
  })

  it('explains why a network cannot be opened', async () => {
    await render(<NetworkListScreen />)
    await press('Office, Remote Access')
    expect(screen.getByText('Permission Denied')).toBeTruthy()
    await press('OK')
    await press('Garage, Troubleshoot')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  })

  it('asks before sending a join request', async () => {
    await render(<NetworkListScreen />)
    await press('Neighbour, JOIN')
    await press('Send')
    expect(screen.getByText(/Request has been sent/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Neighbour, PENDING' })).toBeTruthy()
  })

  it('offers no way to change a read-only list', async () => {
    Object.assign(env.networkApi, { readOnly: () => true })
    await render(<NetworkListScreen />)
    expect(await screen.findByRole('button', { name: 'My Home, Local Access' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Actions for My Home' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Create a new network' })).toBeNull()
  })

  it('deletes a network after the name is typed', async () => {
    await render(<NetworkListScreen />)
    await press('Actions for My Home')
    await press('Delete My Home')
    await press('Proceed')
    await fireEvent.changeText(screen.getByLabelText('Network name'), 'My Home')
    await press('Delete')
    expect(env.getNetworks.execute().joined.map(n => n.id)).not.toContain('n1')
  })
})
