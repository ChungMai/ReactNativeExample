import { GetFavorites } from '../../domain/usecases/GetFavorites';
import { GetPhotoDetail } from '../../domain/usecases/GetPhotoDetail';
import { GetPhotos } from '../../domain/usecases/GetPhotos';
import { ToggleFavorite } from '../../domain/usecases/ToggleFavorite';
import type { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { BaseViewModel } from '../../presentation/viewmodels/BaseViewModel';
import { PhotoDetailViewModel } from '../../presentation/viewmodels/PhotoDetailViewModel';
import { PhotoListViewModel } from '../../presentation/viewmodels/PhotoListViewModel';
import { FakeFavoriteRepository } from '../../testing/fakes';
import { photo, samplePhotos } from '../../testing/fixtures';

const repo = (overrides: Partial<PhotoRepository> = {}): PhotoRepository => ({
  getPhotos: jest.fn().mockResolvedValue(samplePhotos),
  getPhoto: jest.fn().mockResolvedValue(samplePhotos[0]),
  ...overrides,
});

const listVm = (r = repo(), favorites = new FakeFavoriteRepository()) =>
  new PhotoListViewModel(new GetPhotos(r), new GetFavorites(favorites), new ToggleFavorite(favorites));

test('view models inherit from BaseViewModel', () => {
  expect(listVm()).toBeInstanceOf(BaseViewModel);
  expect(new PhotoDetailViewModel(new GetPhotoDetail(repo()), '1')).toBeInstanceOf(BaseViewModel);
});

test('list view model loads, switches tabs, filters by author and notifies', async () => {
  const favorites = new FakeFavoriteRepository();
  await favorites.add(samplePhotos[1]);
  const vm = listVm(repo(), favorites);
  const listener = jest.fn();
  vm.subscribe(listener);
  expect(vm.loading).toBe(true);

  await vm.init();
  expect(vm.loading).toBe(false);
  expect(vm.tab).toBe('all');
  expect(vm.visiblePhotos).toHaveLength(3);

  vm.selectTab('favorites');
  expect(vm.visiblePhotos.map(x => x.author)).toEqual(['Ann Lee']);

  vm.selectTab('all');
  vm.setAuthor('zo');
  expect(vm.visiblePhotos.map(x => x.author)).toEqual(['Zoe Adams']);
  expect(listener).toHaveBeenCalled();
});

test('the favorites tab updates when a photo is (un)favorited', async () => {
  const vm = listVm();
  await vm.init();
  vm.selectTab('favorites');
  expect(vm.visiblePhotos).toEqual([]);

  await vm.toggleFavorite(samplePhotos[0]);
  expect(vm.visiblePhotos.map(x => x.id)).toEqual(['1']);

  await vm.toggleFavorite(samplePhotos[0]);
  expect(vm.visiblePhotos).toEqual([]);
});

test('list view model asks for 50 photos with one photo per author', async () => {
  const r = repo({
    getPhotos: jest.fn().mockResolvedValue([...samplePhotos, photo('9', 'Zoe Adams')]),
  });
  const vm = listVm(r);
  await vm.init();
  expect(r.getPhotos).toHaveBeenCalledWith(1, 50);
  expect(vm.visiblePhotos.map(x => x.id)).toEqual(['1', '2', '3']);
});

test('favorites are loaded at init and toggled through the use case', async () => {
  const favorites = new FakeFavoriteRepository();
  await favorites.add(samplePhotos[0]);
  const vm = listVm(repo(), favorites);
  await vm.init();
  expect(vm.isFavorite('1')).toBe(true);
  expect(vm.favoriteCount).toBe(1);

  await vm.toggleFavorite(samplePhotos[1]);
  expect(vm.isFavorite('2')).toBe(true);
  expect(favorites.items.has('2')).toBe(true);

  await vm.toggleFavorite(samplePhotos[1]);
  expect(vm.isFavorite('2')).toBe(false);
  expect(vm.favoriteCount).toBe(1);
});

test('a failing favorite save is reported instead of thrown', async () => {
  const favorites = new FakeFavoriteRepository();
  favorites.add = jest.fn().mockRejectedValue(new Error('disk full'));
  const vm = listVm(repo(), favorites);
  await vm.init();
  await expect(vm.toggleFavorite(samplePhotos[0])).resolves.toBeUndefined();
  expect(vm.actionError).toContain('disk full');
  expect(vm.isFavorite('1')).toBe(false);
});

test('errors are captured, unsubscribed listeners are not called', async () => {
  const vm = listVm(repo({ getPhotos: jest.fn().mockRejectedValue(new Error('boom')) }));
  const listener = jest.fn();
  vm.subscribe(listener)();
  await vm.init();
  expect(vm.error).toBe('boom');
  expect(vm.loading).toBe(false);
  expect(listener).not.toHaveBeenCalled();
});

test('detail view model loads one photo', async () => {
  const vm = new PhotoDetailViewModel(new GetPhotoDetail(repo()), '1');
  await vm.init();
  expect(vm.photo?.author).toBe('Zoe Adams');
});
