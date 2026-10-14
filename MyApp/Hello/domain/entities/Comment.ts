import { BannedWordsRule, MaxLengthRule, NotEmptyRule } from '../validation/TextRule';
import { TextValidator } from '../validation/TextValidator';

export class Comment {
  // static members belong to the class (slide 12).
  static readonly MAX_LENGTH = 200;
  static readonly validator = new TextValidator([
    new NotEmptyRule(),
    new MaxLengthRule(Comment.MAX_LENGTH),
    new BannedWordsRule(['spam', 'scam']),
  ]);

  // readonly: assigned once in the constructor (slide 10).
  readonly id: string;
  readonly photoId: string;
  readonly createdAt: Date;
  // optional: undefined until the comment is edited (slide 10).
  editedAt?: Date;
  // #private: unreachable from outside, even at runtime (slides 9, 13).
  #text: string;

  // private constructor: go through Comment.create() or Comment.restore().
  private constructor(id: string, photoId: string, text: string, createdAt: Date) {
    Comment.validator.assertValid(text);
    this.id = id;
    this.photoId = photoId;
    this.#text = text.trim();
    this.createdAt = createdAt;
  }

  // Static factory: a brand-new comment (slide 12).
  static create(id: string, photoId: string, text: string): Comment {
    return new Comment(id, photoId, text, new Date());
  }

  // Static factory: rebuild a comment that was saved earlier.
  static restore(id: string, photoId: string, text: string, createdAt: Date, editedAt?: Date): Comment {
    const comment = new Comment(id, photoId, text, createdAt);
    comment.editedAt = editedAt;
    return comment;
  }

  get text(): string {
    return this.#text;
  }

  // The setter validates before changing state (slide 11).
  set text(value: string) {
    Comment.validator.assertValid(value);
    const trimmed = value.trim();
    if (trimmed !== this.#text) {
      this.#text = trimmed;
      this.editedAt = new Date();
    }
  }

  // Computed read-only value: a getter without a setter (slide 11).
  get isEdited(): boolean {
    return this.editedAt !== undefined;
  }
}
