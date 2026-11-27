import { fireEvent, render, screen } from '@testing-library/react-native'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import LoginScreen from '@/features/auth/presentation/shared/screens/login-screen'

jest.mock('@/di/container', () => ({ container: {} }))

let env: ReturnType<typeof makeEnv>
beforeEach(() => {
  env = makeEnv()
  Object.assign(container, env)
})

const fill = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByLabelText('Email'), email)
  await fireEvent.changeText(screen.getByLabelText('Password'), password)
}
const submit = () => fireEvent.press(screen.getByRole('button', { name: 'Login' }))

describe('LoginScreen', () => {
  it('explains what is missing', async () => {
    await render(<LoginScreen />)
    await submit()
    expect(screen.getByText('Please enter the registered email address')).toBeTruthy()
    await fill('demo', 'x')
    await submit()
    expect(screen.getByText('Please enter a valid Email')).toBeTruthy()
  })

  it('shows an error for a wrong password', async () => {
    await render(<LoginScreen />)
    await fill('demo@example.com', 'wrong')
    await submit()
    expect(await screen.findByText('Invalid email or password')).toBeTruthy()
    expect(env.getSession.execute()).toBeUndefined()
  })

  it('signs in with "keep me signed in"', async () => {
    await render(<LoginScreen />)
    await fill('demo@example.com', 'demo1234')
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Keep me signed in' }))
    await submit()
    expect(env.getSession.execute()).toMatchObject({ email: 'demo@example.com', keepSignedIn: true })
  })

  it('shows and hides the password', async () => {
    await render(<LoginScreen />)
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true)
    await fireEvent.press(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false)
  })
})
