import { AllFilter, AuthorFilter, FavoriteFilter } from '../../domain/filters/PhotoFilter';
import type { PhotoFilter } from '../../domain/filters/PhotoFilter';
import { PhotoQuery } from '../../domain/filters/PhotoQuery';
import { samplePhotos } from '../../testing/fixtures';

const ids = (filter: PhotoFilter) => filter.apply(samplePhotos).map(p => p.id);

test('filters are polymorphic over PhotoFilter', () => {
  expect(ids(new AllFilter())).toEqual(['1', '2', '3']);
  expect(ids(new FavoriteFilter(new Set(['3', '1'])))).toEqual(['1', '3']);
  expect(ids(new FavoriteFilter(new Set()))).toEqual([]);
  expect(ids(new AuthorFilter('AN'))).toEqual(['2']);
});

test('subclass overrides describe() and extends the parent via super', () => {
  expect(new FavoriteFilter(new Set()).describe()).toBe('Filter "Favorites"');
  expect(new AuthorFilter('an').describe()).toContain('contains "an"');
});

test('query chains filters, each call returning this', () => {
  const query = new PhotoQuery();
  expect(query.and(new FavoriteFilter(new Set(['1', '2']))).and(new AuthorFilter('zoe'))).toBe(query);
  expect(query.run(samplePhotos).map(p => p.id)).toEqual(['1']);
});
