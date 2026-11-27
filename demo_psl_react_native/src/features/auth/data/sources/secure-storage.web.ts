// Web has no secure store. localStorage can be read by any script on the page, so only
// non-secret data goes here (email and times). A real token belongs in an HttpOnly cookie.
import type { TextStorage } from './session-store'

const storageAt = (key: string): TextStorage => ({
  read: () => globalThis.localStorage.getItem(key),
  write: value => globalThis.localStorage.setItem(key, value),
})

export const secureStorage = storageAt('auth.session')
export const serverStorage = storageAt('auth.server')

// Tokens must not sit in localStorage: on web they only live until the page is reloaded.
function memory(): TextStorage {
  let value: string | null = null
  return { read: () => value, write: next => { value = next } }
}
export const tokenOwnerStorage = memory()
export const refreshTokenStorage = memory()
