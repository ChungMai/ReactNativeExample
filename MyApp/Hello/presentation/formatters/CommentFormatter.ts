import { Comment } from '../../domain/entities/Comment';

export class CommentFormatter {
  // Overload signatures: callers see only these (slide 7).
  format(date: Date): string;
  format(comment: Comment): string;
  // One implementation handles both: we check the type ourselves.
  format(value: Date | Comment): string {
    if (value instanceof Comment) {
      const when = this.format(value.createdAt);
      return value.isEdited ? `${when} · edited` : when;
    }
    const seconds = Math.round((Date.now() - value.getTime()) / 1000);
    if (seconds < 60) {
      return 'just now';
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} min ago`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} h ago`;
    }
    return value.toISOString().slice(0, 10);
  }
}
