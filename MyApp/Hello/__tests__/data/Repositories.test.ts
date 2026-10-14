import { PicsumApi } from '../../data/datasources/PicsumApi';
import { toCommentDto } from '../../data/mappers/CommentMapper';
import { toPhoto, toPhotoDto } from '../../data/mappers/PhotoMapper';
import { PhotoRepositoryImpl } from '../../data/repositories/PhotoRepositoryImpl';
import { StoredCommentRepository } from '../../data/repositories/StoredCommentRepository';
import { StoredFavoriteRepository } from '../../data/repositories/StoredFavoriteRepository';
import { RandomIdGenerator } from '../../data/services/RandomIdGenerator';
import { MemoryKeyValueStorage } from '../../data/storage/MemoryKeyValueStorage';
import type { KeyValueStorage } from '../../data/storage/KeyValueStorage';
import { StoredRepository } from '../../data/storage/StoredRepository';
import { Comment } from '../../domain/entities/Comment';
import { photo, photoDto } from '../../testing/fixtures';

describe('mappers', () => {
  test('PhotoMapper converts both ways', () => {
    const dto = photoDto('7', 'Bob', 200, 100);
    const entity = toPhoto(dto);
    expect(entity.downloadUrl).toBe(dto.download_url);
    expect(entity.pageUrl).toBe(dto.url);
    expect(toPhotoDto(entity)).toEqual(dto);
  });

  test('CommentMapper keeps dates as ISO strings', () => {
    const dto = toCommentDto(Comment.create('c', 'p', 'hi'));
    expect(typeof dto.createdAt).toBe('string');
    expect(dto.editedAt).toBeUndefined();
  });
});

describe('PicsumApi', () => {
  afterEach(() => jest.restoreAllMocks());

  test('throws on a non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(new PicsumApi().fetchPhoto('1')).rejects.toThrow('Request failed: 500');
  });
});

describe('PhotoRepositoryImpl', () => {
  const api = () => new PicsumApi();

  test('maps API results to entities and caches the first page', async () => {
    const storage = new MemoryKeyValueStorage();
    const a = api();
    jest.spyOn(a, 'fetchPhotos').mockResolvedValue([photoDto('1', 'Ann')]);
    const photos = await new PhotoRepositoryImpl(a, storage).getPhotos(1, 10);
    expect(photos[0].author).toBe('Ann');
    expect(await storage.getItem('photos:cache')).toContain('Ann');
  });

  test('falls back to the cache when the network fails', async () => {
    const storage = new MemoryKeyValueStorage();
    const a = api();
    const spy = jest.spyOn(a, 'fetchPhotos');
    spy.mockResolvedValueOnce([photoDto('1', 'Ann')]);
    const repo = new PhotoRepositoryImpl(a, storage);
    await repo.getPhotos(1, 10);

    spy.mockRejectedValueOnce(new TypeError('Network request failed'));
    expect((await repo.getPhotos(1, 10))[0].author).toBe('Ann');

    jest.spyOn(a, 'fetchPhoto').mockRejectedValueOnce(new TypeError('Network request failed'));
    expect((await repo.getPhoto('1')).author).toBe('Ann');
  });

  test('gives a friendly error when there is no cache either', async () => {
    const a = api();
    jest.spyOn(a, 'fetchPhotos').mockRejectedValue(new TypeError('Network request failed'));
    const repo = new PhotoRepositoryImpl(a, new MemoryKeyValueStorage());
    await expect(repo.getPhotos(1, 10)).rejects.toThrow('Cannot reach the server');
  });
});

describe('stored repositories (persistence)', () => {
  test('comments survive a "restart" (new repository on the same storage)', async () => {
    const storage = new MemoryKeyValueStorage();
    const first = new StoredCommentRepository(storage);
    const c = Comment.create('c1', 'p1', 'persisted');
    await first.add(c);
    c.text = 'persisted and edited';
    await first.update(c);

    const second = new StoredCommentRepository(storage);
    const [loaded] = await second.getByPhoto('p1');
    expect(loaded.text).toBe('persisted and edited');
    expect(loaded.isEdited).toBe(true);
    expect(loaded.createdAt).toEqual(c.createdAt);
    expect(await second.getByPhoto('other')).toEqual([]);

    await second.remove('c1');
    expect(await new StoredCommentRepository(storage).findById('c1')).toBeUndefined();
  });

  test('favorites survive a "restart"', async () => {
    const storage = new MemoryKeyValueStorage();
    await new StoredFavoriteRepository(storage).add(photo('9', 'Zed'));
    const all = await new StoredFavoriteRepository(storage).getAll();
    expect(all.map(p => p.id)).toEqual(['9']);
  });

  test('corrupt stored data starts empty instead of crashing', async () => {
    const storage: KeyValueStorage = {
      getItem: async () => '{not json',
      setItem: async () => {},
    };
    expect(await new StoredFavoriteRepository(storage).getAll()).toEqual([]);
  });

  test('both repositories reuse the generic StoredRepository base', () => {
    const storage = new MemoryKeyValueStorage();
    expect(new StoredCommentRepository(storage)).toBeInstanceOf(StoredRepository);
    expect(new StoredFavoriteRepository(storage)).toBeInstanceOf(StoredRepository);
  });
});

test('RandomIdGenerator produces unique ids', () => {
  const g = new RandomIdGenerator();
  expect(new Set(Array.from({ length: 50 }, () => g.next())).size).toBe(50);
});
