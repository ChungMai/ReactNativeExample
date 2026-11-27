import { PersistentSessionStore, type TextStorage } from '@/features/auth/data/sources/session-store'

const session = { email: 'demo@example.com', signedInAt: 5, keepSignedIn: true }

function fakeStorage(initial: string | null = null) {
  let value = initial
  return { read: () => value, write: (v: string) => { value = v } } satisfies TextStorage
}

describe('PersistentSessionStore', () => {
  it('restores what a previous launch saved', () => {
    const storage = fakeStorage()
    new PersistentSessionStore(storage).set({ session, lastEmail: session.email })
    expect(new PersistentSessionStore(storage).get()).toEqual({ session, lastEmail: session.email })
  })

  it('returns the same reference until it changes', () => {
    const store = new PersistentSessionStore(fakeStorage(JSON.stringify({ session })))
    expect(store.get()).toBe(store.get())
  })

  it.each(['not json', 'null', '{"session":{"email":"a@b.co"}}'])('treats %s as signed out', stored => {
    expect(new PersistentSessionStore(fakeStorage(stored)).get().session).toBeUndefined()
  })

  it('keeps working in memory when the storage fails', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const fail = () => { throw new Error('locked') }
    const store = new PersistentSessionStore({ read: fail, write: fail })
    store.set({ session })
    expect(store.get().session).toEqual(session)
    jest.restoreAllMocks()
  })
})
