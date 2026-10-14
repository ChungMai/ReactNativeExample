import type { TextRule } from './TextRule';

export class ValidationError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join('; '));
    this.name = 'ValidationError';
  }
}

// Polymorphism (slide 21): the validator works with any mix of TextRule subclasses.
export class TextValidator {
  constructor(private readonly rules: readonly TextRule[]) {}

  validate(text: string): string[] {
    return this.rules.map(rule => rule.check(text)).filter((e): e is string => e !== null);
  }

  assertValid(text: string): void {
    const errors = this.validate(text);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
}
