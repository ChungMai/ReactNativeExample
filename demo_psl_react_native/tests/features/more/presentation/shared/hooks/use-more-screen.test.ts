import { renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { useMoreScreen } from '@/features/more/presentation/shared/hooks/use-more-screen'

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))

describe('useMoreScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists the hooks demo as a menu entry', async () => {
    const { result } = await renderHook(() => useMoreScreen())
    expect(result.current.items.map(i => i.id)).toEqual(['hooks-demo'])
    expect(result.current.items[0].title).toBe('React hooks demo')
  })

  it('opens the hooks demo route', async () => {
    const { result } = await renderHook(() => useMoreScreen())
    result.current.items[0].open()
    expect(router.push).toHaveBeenCalledWith('/hooks-demo')
  })
})
