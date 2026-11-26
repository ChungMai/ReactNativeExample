import { InMemoryStore } from '@/shared/data/in-memory-store'

describe('InMemoryStore', () => {
  it('returns the initial value', () => {
    expect(new InMemoryStore(1).get()).toBe(1)
  })

  it('notifies subscribers on set and stops after unsubscribe', () => {
    const store = new InMemoryStore(1)
    const listener = jest.fn()
    const unsubscribe = store.subscribe(listener)

    store.set(2)
    expect(store.get()).toBe(2)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.set(3)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
