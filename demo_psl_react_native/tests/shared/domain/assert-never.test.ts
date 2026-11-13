import { assertNever } from '@/shared/domain/assert-never'

describe('assertNever', () => {
  it('throws with the unhandled value', () => {
    expect(() => assertNever('x' as never)).toThrow('Unhandled case: "x"')
  })
})
