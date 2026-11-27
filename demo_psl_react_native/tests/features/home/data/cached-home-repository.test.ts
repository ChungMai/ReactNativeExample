import { CachedHomeRepository } from '@/features/home/data/cached-home-repository'
import { HOME_SEED } from '@/features/home/data/home-seed'
import { FakeHomeApi } from '@/features/home/data/sources/home-api'
import { AppError } from '@/shared/domain/app-error'

describe('CachedHomeRepository', () => {
  it('keeps the same state reference when a refresh changes nothing', async () => {
    const repository = new CachedHomeRepository(new FakeHomeApi())
    const before = repository.getState()
    await repository.refresh()
    expect(repository.getState()).toBe(before)
  })

  it('goes offline but keeps the cached data, then recovers', async () => {
    const api = new FakeHomeApi(new AppError('network', 'offline'))
    const repository = new CachedHomeRepository(api)
    const cached = repository.getState().snapshot
    await expect(repository.refresh()).rejects.toThrow('offline')
    expect(repository.getState()).toEqual({ snapshot: cached, serverOnline: false })
    api.failWith = undefined
    await repository.refresh()
    expect(repository.getState().serverOnline).toBe(true)
  })

  it('maps the DTO, dropping duplicated favourites', () => {
    const dto = { ...HOME_SEED, favourites: { ...HOME_SEED.favourites, devices: ['d1', 'd1'] } }
    const { snapshot } = new CachedHomeRepository(new FakeHomeApi(), dto).getState()
    expect(snapshot.favourites.device).toEqual(['d1'])
    expect(snapshot.scenes[1].states).toEqual({ d1: false, d2: true })
  })
})
