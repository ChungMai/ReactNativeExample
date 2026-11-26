// Tiny observable store, reused by the in-memory repositories.
export class InMemoryStore<T> {
  private listeners = new Set<() => void>()
  constructor(private value: T) {}

  get = () => this.value

  set(value: T) {
    this.value = value
    this.listeners.forEach(l => l())
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
}
