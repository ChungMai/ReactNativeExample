import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStorage } from './KeyValueStorage';

// Adapter: makes the AsyncStorage library fit our KeyValueStorage contract.
export class AsyncStorageAdapter implements KeyValueStorage {
  getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }
}
