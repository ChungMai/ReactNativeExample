import { sizeClassFor } from '@/shared/hooks/use-size-class'
import { tileWidthFor } from '@/shared/hooks/use-grid-tile'
import { GRID_GAP, PAGE_PADDING, REGULAR_MIN_WIDTH, SIDEBAR_WIDTH } from '@/shared/layout'

describe('sizeClassFor', () => {
  it('is compact below the breakpoint and regular from it', () => {
    expect(sizeClassFor(390)).toBe('compact') // iPhone
    expect(sizeClassFor(REGULAR_MIN_WIDTH - 1)).toBe('compact') // iPad in a narrow Split View
    expect(sizeClassFor(REGULAR_MIN_WIDTH)).toBe('regular')
    expect(sizeClassFor(1024)).toBe('regular') // iPad landscape or a Mac window
  })
})

describe('tileWidthFor', () => {
  it.each([800, 1024, 1180, 1366, 1728])('fills the row exactly at window width %i', windowWidth => {
    const content = windowWidth - SIDEBAR_WIDTH - PAGE_PADDING * 2
    const tile = tileWidthFor(windowWidth)
    const columns = Math.round((content + GRID_GAP) / (tile + GRID_GAP))
    expect(columns).toBeGreaterThanOrEqual(2)
    // the tiles plus the gaps use the whole content width, to within one point of rounding per tile
    expect(Math.abs(columns * tile + GRID_GAP * (columns - 1) - content)).toBeLessThan(columns)
  })

  it('adds columns as the window gets wider', () => {
    const columnsAt = (w: number) => {
      const content = w - SIDEBAR_WIDTH - PAGE_PADDING * 2
      return Math.round((content + GRID_GAP) / (tileWidthFor(w) + GRID_GAP))
    }
    expect(columnsAt(800)).toBe(2)
    expect(columnsAt(1024)).toBe(3)
    expect(columnsAt(1728)).toBeGreaterThan(columnsAt(1024))
  })
})
