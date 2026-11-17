// One list of destinations feeds both the mobile tab bar and the web left menu.
import { fireEvent, render, screen } from '@testing-library/react-native'
import { router, usePathname } from 'expo-router'
import { isActive, navItems } from '@/shared/navigation/shared/nav-items'
import { Sidebar } from '@/shared/navigation/shared/sidebar'

jest.mock('expo-router', () => ({
  router: { navigate: jest.fn() },
  usePathname: jest.fn(),
}))

const item = (name: string) => navItems.find(i => i.name === name)!

describe('nav items', () => {
  it('lists the five destinations in order', () => {
    expect(navItems.map(i => i.title)).toEqual(['Home', 'Devices', 'Rooms', 'Groups', 'More'])
  })

  it('matches a path and its children, but not a similar prefix', () => {
    expect(isActive(item('rooms'), '/rooms')).toBe(true)
    expect(isActive(item('rooms'), '/room/r1')).toBe(true) // detail screens belong to Rooms
    expect(isActive(item('rooms'), '/room/new')).toBe(true)
    expect(isActive(item('devices'), '/rooms')).toBe(false)
    expect(isActive(item('home'), '/homework')).toBe(false)
    expect(isActive(item('more'), '/hooks-demo')).toBe(true) // opened from the More menu
  })
})

describe('Sidebar (web left menu)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders every destination and marks the current one as selected', async () => {
    jest.mocked(usePathname).mockReturnValue('/room/r1')
    await render(<Sidebar />)
    for (const i of navItems) expect(screen.getByRole('link', { name: i.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Rooms' })).toBeSelected()
    expect(screen.getByRole('link', { name: 'Devices' })).not.toBeSelected()
  })

  it('navigates when an item is pressed', async () => {
    jest.mocked(usePathname).mockReturnValue('/rooms')
    await render(<Sidebar />)
    await fireEvent.press(screen.getByRole('link', { name: 'Devices' }))
    expect(router.navigate).toHaveBeenCalledWith('/devices')
  })
})
