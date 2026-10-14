import { Comment } from '../../domain/entities/Comment';
import { BannedWordsRule, MaxLengthRule, NotEmptyRule } from '../../domain/validation/TextRule';
import { TextValidator } from '../../domain/validation/TextValidator';

describe('Comment entity', () => {
  test('static factory creates a valid comment', () => {
    const c = Comment.create('c1', 'p1', ' hello ');
    expect(c.id).toBe('c1');
    expect(c.photoId).toBe('p1');
    expect(c.text).toBe('hello');
    expect(c.isEdited).toBe(false);
    expect(c.editedAt).toBeUndefined();
  });

  test('invalid text is rejected', () => {
    expect(() => Comment.create('c', 'p', '   ')).toThrow('cannot be empty');
    expect(() => Comment.create('c', 'p', 'x'.repeat(Comment.MAX_LENGTH + 1))).toThrow('at most');
    expect(() => Comment.create('c', 'p', 'this is SPAM')).toThrow('banned word');
  });

  test('setter validates and marks the comment as edited', () => {
    const c = Comment.create('c', 'p', 'first');
    c.text = 'first';
    expect(c.isEdited).toBe(false);
    c.text = 'second';
    expect(c.text).toBe('second');
    expect(c.isEdited).toBe(true);
    expect(() => {
      c.text = '';
    }).toThrow();
    expect(c.text).toBe('second');
  });

  test('restore rebuilds a saved comment, including its edit date', () => {
    const created = new Date('2024-01-01T00:00:00Z');
    const edited = new Date('2024-01-02T00:00:00Z');
    const c = Comment.restore('c', 'p', 'saved', created, edited);
    expect(c.createdAt).toEqual(created);
    expect(c.isEdited).toBe(true);
  });

  test('#text is not reachable from outside', () => {
    const c = Comment.create('c', 'p', 'secret');
    expect(Object.keys(c)).not.toContain('text');
    expect(Object.keys(c)).not.toContain('#text');
  });
});

test('validator collects errors from every rule (polymorphism)', () => {
  const v = new TextValidator([new NotEmptyRule(), new MaxLengthRule(3), new BannedWordsRule(['bad'])]);
  expect(v.validate('ok')).toEqual([]);
  expect(v.validate('bad!')).toHaveLength(2);
  expect(v.validate('')).toHaveLength(1);
});
