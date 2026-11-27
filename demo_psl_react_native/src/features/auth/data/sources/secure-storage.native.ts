// iOS and Android: Keychain / Keystore.
import { getItem, setItem } from 'expo-secure-store'
import type { TextStorage } from './session-store'

const storageAt = (key: string): TextStorage => ({
  read: () => getItem(key),
  write: value => setItem(key, value),
})

export const secureStorage = storageAt('auth.session')
export const serverStorage = storageAt('auth.server')
