// The More menu looks different on iPhone, iPad/Mac and web, but it is the same list and the same behaviour.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import DesktopMoreScreen from '@/features/more/presentation/desktop/screens/more-screen'
import MobileMoreScreen from '@/features/more/presentation/mobile/screens/more-screen'
import WebMoreScreen from '@/features/more/presentation/web/screens/more-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))

describe.each([
  ['mobile', MobileMoreScreen, false],
  ['desktop', DesktopMoreScreen, true],
  ['web', WebMoreScreen, true],
])('MoreScreen (%s)', (_name, MoreScreen, hasPageTitle) => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.assign(container, makeEnv())
  })

  it('shows the hooks demo entry and opens it when pressed', async () => {
    await render(<MoreScreen />)
    expect(screen.getByText('useState, useEffect, useRef, custom hooks and the React Native hooks')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'React hooks demo' }))
    expect(router.push).toHaveBeenCalledWith('/hooks-demo')
  })

  it(hasPageTitle ? 'draws its own page title' : 'leaves the title to the native header', async () => {
    await render(<MoreScreen />)
    expect(screen.queryByRole('heading', { name: 'More' }) !== null).toBe(hasPageTitle)
  })
})
