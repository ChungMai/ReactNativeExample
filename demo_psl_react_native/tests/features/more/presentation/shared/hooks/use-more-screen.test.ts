import { renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import { container } from '@/di/container'
import { useMoreScreen } from '@/features/more/presentation/shared/hooks/use-more-screen'
import { makeEnv } from '@tests/helpers/make-env'

jest.mock('@/di/container', () => ({ container: {} }))
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))

const ids = async (network: 'n1' | null) => {
  const env = makeEnv()
  Object.assign(container, env)
  await env.refreshNetworks.execute()
  if (network) env.selectNetwork.execute(network)
  const { result } = await renderHook(() => useMoreScreen())
  return result.current.groups[0]
}

it('gives a primary user every entry, and each opens its page', async () => {
  const sections = await ids('n1')
  expect(sections).toHaveLength(10)
  for (const section of sections) section.open()
  expect(router.push).toHaveBeenCalledTimes(10)
  expect(router.push).toHaveBeenCalledWith({ pathname: '/more/[section]', params: { section: 'users' } })
})

it('gives anyone else zones, presets and scenes only', async () => {
  expect((await ids(null)).map(s => s.id)).toEqual(['zones', 'presets', 'scenes'])
})
