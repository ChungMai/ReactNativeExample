import type { Comment } from '../../domain/entities/Comment';
import type { AddCommentInput } from '../../domain/usecases/AddComment';
import type { EditCommentInput } from '../../domain/usecases/EditComment';
import type { UseCase } from '../../domain/usecases/UseCase';
import { BaseViewModel } from './BaseViewModel';

export class CommentsViewModel extends BaseViewModel {
  comments: Comment[] = [];
  draft = '';
  editing: Comment | null = null;
  formError: string | null = null;

  constructor(
    private readonly photoId: string,
    private readonly getComments: UseCase<string, Comment[]>,
    private readonly addComment: UseCase<AddCommentInput, Comment>,
    private readonly editComment: UseCase<EditCommentInput, Comment>,
    private readonly deleteComment: UseCase<string, void>,
  ) {
    super();
  }

  override init(): Promise<void> {
    return this.load(
      () => this.getComments.execute(this.photoId),
      comments => {
        this.comments = comments;
      },
    );
  }

  get isEditing(): boolean {
    return this.editing !== null;
  }

  setDraft(text: string): void {
    this.draft = text;
    this.formError = null;
    this.notify();
  }

  startEdit(comment: Comment): void {
    this.editing = comment;
    this.draft = comment.text;
    this.formError = null;
    this.notify();
  }

  cancelEdit(): void {
    this.resetForm();
    this.notify();
  }

  async submit(): Promise<void> {
    try {
      if (this.editing) {
        await this.editComment.execute({ id: this.editing.id, text: this.draft });
      } else {
        await this.addComment.execute({ photoId: this.photoId, text: this.draft });
      }
      this.resetForm();
      await this.refresh();
    } catch (e) {
      this.formError = e instanceof Error ? e.message : 'Cannot save comment';
      this.notify();
    }
  }

  async remove(comment: Comment): Promise<void> {
    await this.deleteComment.execute(comment.id);
    if (this.editing?.id === comment.id) {
      this.resetForm();
    }
    await this.refresh();
  }

  private resetForm(): void {
    this.editing = null;
    this.draft = '';
    this.formError = null;
  }

  // Reloads silently (no spinner); also used to refresh a read-only preview.
  async refresh(): Promise<void> {
    this.comments = await this.getComments.execute(this.photoId);
    this.notify();
  }
}
