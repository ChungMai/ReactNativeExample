import type { IdGenerator } from '../../domain/services/IdGenerator';

// Unique across app restarts (a plain counter would restart at 1 and collide with saved data).
export class RandomIdGenerator implements IdGenerator {
  next(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
