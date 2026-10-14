// Abstraction (slide 18): each rule decides for itself what "valid" means.
export abstract class TextRule {
  // Returns an error message, or null when the text is valid.
  abstract check(text: string): string | null;
}

export class NotEmptyRule extends TextRule {
  check(text: string): string | null {
    return text.trim() === '' ? 'Comment cannot be empty' : null;
  }
}

export class MaxLengthRule extends TextRule {
  constructor(private readonly max: number) {
    super();
  }
  check(text: string): string | null {
    return text.trim().length > this.max ? `Comment must be at most ${this.max} characters` : null;
  }
}

export class BannedWordsRule extends TextRule {
  constructor(private readonly words: readonly string[]) {
    super();
  }
  check(text: string): string | null {
    const lower = text.toLowerCase();
    const hit = this.words.find(w => lower.includes(w));
    return hit ? `Comment contains a banned word: "${hit}"` : null;
  }
}
