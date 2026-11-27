import { routes } from '@/shared/routes'

describe('routes', () => {
  it('builds the room detail route with its id param', () => {
    expect(routes.room('r2')).toEqual({ pathname: '/room/[id]', params: { id: 'r2' } })
  })
})
