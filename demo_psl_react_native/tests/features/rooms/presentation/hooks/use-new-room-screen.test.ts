import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { makeEnv } from '@tests/helpers/make-env'
import { useNewRoomScreen } from '@/features/rooms/presentation/hooks/use-new-room-screen'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(container, makeEnv())
})

describe('useNewRoomScreen', () => {
  it('starts empty and cannot be saved', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    expect(result.current).toMatchObject({ name: '', cover: 0, deviceIds: [], picking: false, canSave: false })
    expect(result.current.devices).toHaveLength(6)
    expect(result.current.selectedDevices).toEqual([])
  })

  it('canSave follows the name', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    await act(async () => result.current.setName('   '))
    expect(result.current.canSave).toBe(false)
    await act(async () => result.current.setName('Kitchen'))
    expect(result.current.canSave).toBe(true)
  })

  it('nextCover() cycles through every cover and wraps around', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    const count = result.current.coverCount
    await act(async () => result.current.nextCover())
    expect(result.current.cover).toBe(1)
    for (let i = 1; i < count; i++) await act(async () => result.current.nextCover())
    expect(result.current.cover).toBe(0)
  })

  it('toggleDevice() selects and deselects a device', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    await act(async () => result.current.toggleDevice('d4'))
    expect(result.current.deviceIds).toEqual(['d4'])
    expect(result.current.selectedDevices.map(d => d.title)).toEqual(['Desk fan'])
    await act(async () => result.current.toggleDevice('d4'))
    expect(result.current.deviceIds).toEqual([])
  })

  it('togglePicker() opens and closes the device picker', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    await act(async () => result.current.togglePicker())
    expect(result.current.picking).toBe(true)
    await act(async () => result.current.togglePicker())
    expect(result.current.picking).toBe(false)
  })

  it('save() creates the room and goes back', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    await act(async () => { result.current.setName('  Kitchen '); result.current.nextCover(); result.current.toggleDevice('d4') })
    await act(async () => result.current.save())
    const created = container.getAllRooms.execute().at(-1)
    expect(created).toMatchObject({ name: 'Kitchen', cover: 1, deviceIds: ['d4'], favourite: false })
    expect(container.getAllRooms.execute()).toHaveLength(4)
    expect(router.back).toHaveBeenCalledTimes(1)
  })

  it('save() does nothing while the name is blank', async () => {
    const { result } = await renderHook(() => useNewRoomScreen())
    await act(async () => result.current.save())
    expect(container.getAllRooms.execute()).toHaveLength(3)
    expect(router.back).not.toHaveBeenCalled()
  })
})
