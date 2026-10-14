import type { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { AddComment } from '../../domain/usecases/AddComment';
import { DeleteComment } from '../../domain/usecases/DeleteComment';
import { EditComment } from '../../domain/usecases/EditComment';
import { GetComments } from '../../domain/usecases/GetComments';
import { GetFavorites } from '../../domain/usecases/GetFavorites';
import { GetPhotoDetail } from '../../domain/usecases/GetPhotoDetail';
import { GetPhotos } from '../../domain/usecases/GetPhotos';
import { ToggleFavorite } from '../../domain/usecases/ToggleFavorite';
import { FakeCommentRepository, FakeFavoriteRepository, SequenceIds } from '../../testing/fakes';
import { photo, samplePhotos } from '../../testing/fixtures';

describe('photo use cases', () => {
  const repository: PhotoRepository = {
    getPhotos: jest.fn().mockResolvedValue(samplePhotos),
    getPhoto: jest.fn().mockResolvedValue(samplePhotos[0]),
  };

  test('GetPhotos applies default page and limit', async () => {
    await expect(new GetPhotos(repository).execute()).resolves.toEqual(samplePhotos);
    expect(repository.getPhotos).toHaveBeenCalledWith(1, 10);
    await new GetPhotos(repository).execute({ page: 2, limit: 5 });
    expect(repository.getPhotos).toHaveBeenLastCalledWith(2, 5);
  });

  test('GetPhotos always drops photos with a repeated id', async () => {
    const repo: PhotoRepository = {
      getPhotos: jest.fn().mockResolvedValue([samplePhotos[0], samplePhotos[0], samplePhotos[1]]),
      getPhoto: jest.fn(),
    };
    expect((await new GetPhotos(repo).execute()).map(p => p.id)).toEqual(['1', '2']);
  });

  test('GetPhotos can keep one photo per author, in the original order', async () => {
    const byZoe = photo('9', 'Zoe Adams');
    const repo: PhotoRepository = {
      getPhotos: jest.fn().mockResolvedValue([samplePhotos[0], samplePhotos[1], byZoe, samplePhotos[2]]),
      getPhoto: jest.fn(),
    };
    const unique = await new GetPhotos(repo).execute({ limit: 50, uniqueAuthors: true });
    expect(unique.map(p => p.id)).toEqual(['1', '2', '3']);
    expect(repo.getPhotos).toHaveBeenCalledWith(1, 50);
    expect(await new GetPhotos(repo).execute()).toHaveLength(4);
  });

  test('GetPhotoDetail asks the repository for the id', async () => {
    await expect(new GetPhotoDetail(repository).execute('1')).resolves.toBe(samplePhotos[0]);
    expect(repository.getPhoto).toHaveBeenCalledWith('1');
  });
});

describe('favorite use cases', () => {
  test('ToggleFavorite adds then removes', async () => {
    const repo = new FakeFavoriteRepository();
    const toggle = new ToggleFavorite(repo);
    const get = new GetFavorites(repo);
    await expect(toggle.execute(samplePhotos[0])).resolves.toBe(true);
    expect((await get.execute()).map(p => p.id)).toEqual(['1']);
    await expect(toggle.execute(samplePhotos[0])).resolves.toBe(false);
    expect(await get.execute()).toEqual([]);
  });
});

describe('comment use cases', () => {
  const setup = () => {
    const repo = new FakeCommentRepository();
    return {
      add: new AddComment(repo, new SequenceIds()),
      edit: new EditComment(repo),
      del: new DeleteComment(repo),
      get: new GetComments(repo),
    };
  };

  test('add, edit and delete', async () => {
    const { add, edit, del, get } = setup();
    const c = await add.execute({ photoId: 'p1', text: 'hello' });
    await add.execute({ photoId: 'p2', text: 'other photo' });
    expect(c.id).toBe('id1');
    expect(await get.execute('p1')).toHaveLength(1);

    await edit.execute({ id: c.id, text: 'hello again' });
    const [saved] = await get.execute('p1');
    expect(saved.text).toBe('hello again');
    expect(saved.isEdited).toBe(true);

    await del.execute(c.id);
    expect(await get.execute('p1')).toEqual([]);
  });

  test('edit rejects unknown ids and invalid text', async () => {
    const { add, edit } = setup();
    await expect(edit.execute({ id: 'nope', text: 'x' })).rejects.toThrow('not found');
    const c = await add.execute({ photoId: 'p1', text: 'ok' });
    await expect(edit.execute({ id: c.id, text: '' })).rejects.toThrow('cannot be empty');
  });

  test('GetComments returns the newest first', async () => {
    const { add, get } = setup();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
    await add.execute({ photoId: 'p', text: 'old' });
    jest.setSystemTime(new Date('2024-01-02'));
    await add.execute({ photoId: 'p', text: 'new' });
    jest.useRealTimers();
    expect((await get.execute('p')).map(c => c.text)).toEqual(['new', 'old']);
  });
});
