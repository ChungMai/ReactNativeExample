export type Listener = () => void;

// Abstract base class: shared loading/error/subscribe logic (slide 18).
// Subclasses must implement init() and inherit everything else (slide 14).
export abstract class BaseViewModel {
  #listeners = new Set<Listener>();

  loading = true;
  error: string | null = null;

  abstract init(): Promise<void>;

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  protected notify(): void {
    this.#listeners.forEach(listener => listener());
  }

  protected async load<T>(task: () => Promise<T>, onSuccess: (result: T) => void): Promise<void> {
    this.loading = true;
    this.error = null;
    this.notify();
    try {
      onSuccess(await task());
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Something went wrong';
    } finally {
      this.loading = false;
      this.notify();
    }
  }
}
