// On iOS and Android the shell follows the window size: no menu on a phone, a left menu on an iPad or Mac.
import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { useSizeClass } from '@/shared/hooks/use-size-class'
import { AppShell } from '@/shared/navigation/index.native'

jest.mock('@/shared/hooks/use-size-class')
jest.mock('expo-router', () => ({
  router: { navigate: jest.fn() },
  usePathname: () => '/rooms',
  Tabs: () => null,
  Slot: () => null,
}))

describe('AppShell on iOS and Android', () => {
  it('adds no menu in a compact window (phone)', async () => {
    jest.mocked(useSizeClass).mockReturnValue('compact')
    await render(<AppShell><Text>page</Text></AppShell>)
    expect(screen.getByText('page')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Rooms' })).toBeNull()
  })

  it('adds the left menu in a regular window (iPad, Mac)', async () => {
    jest.mocked(useSizeClass).mockReturnValue('regular')
    await render(<AppShell><Text>page</Text></AppShell>)
    expect(screen.getByText('page')).toBeTruthy()
    for (const title of ['Home', 'Devices', 'Rooms', 'Groups', 'More']) {
      expect(screen.getByRole('link', { name: title })).toBeTruthy()
    }
  })
})
