import type { KeyValueStorage } from './KeyValueStorage';

// Generic + abstract base (slides 18, 22): loads a collection from storage once, keeps it
// in memory, and writes it back after every change. T is the entity, D its stored shape.
export abstract class StoredRepository<T extends { id: string }, D> {
  private loading?: Promise<Map<string, T>>;

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
  ) {}

  protected abstract toDto(item: T): D;
  protected abstract fromDto(dto: D): T;

  protected async all(): Promise<T[]> {
    return [...(await this.load()).values()];
  }

  protected async find(id: string): Promise<T | undefined> {
    return (await this.load()).get(id);
  }

  protected async put(item: T): Promise<void> {
    (await this.load()).set(item.id, item);
    await this.save();
  }

  protected async delete(id: string): Promise<void> {
    (await this.load()).delete(id);
    await this.save();
  }

  private load(): Promise<Map<string, T>> {
    this.loading ??= this.read();
    return this.loading;
  }

  private async read(): Promise<Map<string, T>> {
    const items = new Map<string, T>();
    try {
      const raw = await this.storage.getItem(this.key);
      const dtos: D[] = raw ? JSON.parse(raw) : [];
      dtos.forEach(dto => {
        const item = this.fromDto(dto);
        items.set(item.id, item);
      });
    } catch {
      // Corrupt or unreadable data: start with an empty collection.
    }
    return items;
  }

  private async save(): Promise<void> {
    const items = [...(await this.load()).values()].map(item => this.toDto(item));
    await this.storage.setItem(this.key, JSON.stringify(items));
  }
}
