import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import AddFavouritesScreen from '@/features/home/presentation/shared/screens/add-favourites-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => jest.requireActual('@tests/helpers/mock-home-router'))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('AddFavouritesScreen', () => {
  it('starts with the current favourites and saves the changes', async () => {
    await render(<AddFavouritesScreen />)
    expect(screen.getByRole('checkbox', { name: 'Ceiling light', checked: true })).toBeTruthy()
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Ceiling light' }))
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bedroom' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(container.getHome.execute().snapshot.favourites.device).toEqual(['d6'])
    expect(container.getAllRooms.execute().find(r => r.id === 'r3')?.favourite).toBe(true)
    expect(router.back).toHaveBeenCalled()
  })
})
