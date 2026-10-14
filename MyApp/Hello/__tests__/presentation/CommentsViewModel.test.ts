import { Comment } from '../../domain/entities/Comment';
import { AddComment } from '../../domain/usecases/AddComment';
import { DeleteComment } from '../../domain/usecases/DeleteComment';
import { EditComment } from '../../domain/usecases/EditComment';
import { GetComments } from '../../domain/usecases/GetComments';
import { CommentFormatter } from '../../presentation/formatters/CommentFormatter';
import { BaseViewModel } from '../../presentation/viewmodels/BaseViewModel';
import { CommentsViewModel } from '../../presentation/viewmodels/CommentsViewModel';
import { FakeCommentRepository, SequenceIds } from '../../testing/fakes';

const makeVm = () => {
  const repo = new FakeCommentRepository();
  return new CommentsViewModel(
    'p1',
    new GetComments(repo),
    new AddComment(repo, new SequenceIds()),
    new EditComment(repo),
    new DeleteComment(repo),
  );
};

test('comments view model inherits from BaseViewModel', () => {
  expect(makeVm()).toBeInstanceOf(BaseViewModel);
});

test('post, edit, cancel and delete flow', async () => {
  const vm = makeVm();
  const listener = jest.fn();
  vm.subscribe(listener);
  await vm.init();
  expect(vm.comments).toEqual([]);

  vm.setDraft('first comment');
  await vm.submit();
  expect(vm.comments.map(c => c.text)).toEqual(['first comment']);
  expect(vm.draft).toBe('');

  vm.startEdit(vm.comments[0]);
  expect(vm.isEditing).toBe(true);
  expect(vm.draft).toBe('first comment');
  vm.setDraft('edited comment');
  await vm.submit();
  expect(vm.comments[0].text).toBe('edited comment');
  expect(vm.comments[0].isEdited).toBe(true);
  expect(vm.isEditing).toBe(false);

  vm.startEdit(vm.comments[0]);
  vm.cancelEdit();
  expect(vm.isEditing).toBe(false);
  expect(vm.draft).toBe('');

  await vm.remove(vm.comments[0]);
  expect(vm.comments).toEqual([]);
  expect(listener).toHaveBeenCalled();
});

test('validation errors are shown and keep the draft', async () => {
  const vm = makeVm();
  await vm.init();
  vm.setDraft('   ');
  await vm.submit();
  expect(vm.formError).toContain('cannot be empty');
  expect(vm.comments).toEqual([]);
  vm.setDraft('fixed');
  expect(vm.formError).toBeNull();
});

test('CommentFormatter overloads handle Date and Comment', () => {
  const f = new CommentFormatter();
  expect(f.format(new Date())).toBe('just now');
  expect(f.format(new Date(Date.now() - 5 * 60_000))).toBe('5 min ago');
  const c = Comment.create('c', 'p', 'hi');
  expect(f.format(c)).toBe('just now');
  c.text = 'hi!';
  expect(f.format(c)).toBe('just now · edited');
});
