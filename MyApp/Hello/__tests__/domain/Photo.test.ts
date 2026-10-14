import { photo } from '../../testing/fixtures';

test('Photo exposes behavior derived from its data', () => {
  expect(photo('1', 'A', 400, 200).aspectRatio).toBe(2);
  expect(photo('2', 'B', 200, 400).aspectRatio).toBe(0.5);
});
