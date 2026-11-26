import { routes } from '@/shared/routes'

describe('routes', () => {
  it('builds the room detail route with its id param', () => {
    expect(routes.room('r2')).toEqual({ pathname: '/room/[id]', params: { id: 'r2' } })
  })

  it('builds the edit room route with its id param', () => {
    expect(routes.editRoom('r2')).toEqual({ pathname: '/room/edit/[id]', params: { id: 'r2' } })
  })

  it('has the new room route', () => {
    expect(routes.newRoom).toBe('/room/new')
  })
})
