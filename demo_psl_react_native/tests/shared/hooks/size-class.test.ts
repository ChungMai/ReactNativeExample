import { sizeClassFor } from '@/shared/hooks/use-size-class'
import { REGULAR_MIN_WIDTH } from '@/shared/layout'

describe('sizeClassFor', () => {
  it('is compact below the breakpoint and regular from it', () => {
    expect(sizeClassFor(390)).toBe('compact') // iPhone
    expect(sizeClassFor(REGULAR_MIN_WIDTH - 1)).toBe('compact') // iPad in a narrow Split View
    expect(sizeClassFor(REGULAR_MIN_WIDTH)).toBe('regular')
    expect(sizeClassFor(1024)).toBe('regular') // iPad landscape or a Mac window
  })
})

