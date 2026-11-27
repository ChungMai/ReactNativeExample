import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { AppError } from '@/shared/domain/app-error'
import { makeEnv } from '@tests/helpers/make-env'
import SelectServerScreen from '@/features/auth/presentation/shared/screens/select-server-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
}))

let env: ReturnType<typeof makeEnv>
beforeEach(() => {
  jest.clearAllMocks()
  env = makeEnv()
  Object.assign(container, env)
})

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }))
const openCustom = async () => {
  await press('Server: Default Server')
  await press('Custom Server')
}
const type = (text: string) => fireEvent.changeText(screen.getByLabelText('Server URL / IP Address'), text)

describe('SelectServerScreen', () => {
  it('checks the custom address', async () => {
    await render(<SelectServerScreen />)
    await openCustom()
    await press('Next')
    expect(screen.getByText('Empty Field')).toBeTruthy()
    await type('nonsense')
    await press('Next')
    expect(screen.getByText('Invalid address format')).toBeTruthy()
    expect(env.verifyServer).not.toHaveBeenCalled()
  })

  it('connects to a custom server and returns to login', async () => {
    await render(<SelectServerScreen />)
    await openCustom()
    await type('dev.example.test')
    await press('Next')
    expect(env.getServerSettings.execute().selected).toBe('https://dev.example.test')
    expect(router.back).toHaveBeenCalled()
  })

  it('goes to the start when there is no page to go back to', async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false)
    await render(<SelectServerScreen />)
    await press('Next')
    expect(router.replace).toHaveBeenCalledWith('/')
  })

  it('stays and explains when the server does not answer', async () => {
    env.verifyServer.mockRejectedValue(new AppError('network', 'down'))
    await render(<SelectServerScreen />)
    await openCustom()
    await type('dev.example.test')
    await press('Next')
    expect(screen.getByText(/Not able to connect/)).toBeTruthy()
    expect(router.back).not.toHaveBeenCalled()
  })

  it('removes a saved server', async () => {
    await env.connectServer.execute('dev.example.test')
    await render(<SelectServerScreen />)
    await press('Server: dev.example.test')
    await press('Remove dev.example.test')
    expect(env.getServerSettings.execute().saved).toEqual([])
    expect(screen.getByRole('button', { name: 'Server: Default Server' })).toBeTruthy()
  })
})
