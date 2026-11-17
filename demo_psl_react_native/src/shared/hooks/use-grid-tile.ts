// Width of one tile in a responsive grid that sits to the right of the sidebar.
// As many columns as fit (at least 2); tiles stretch so every row is full.
import { useWindowDimensions } from 'react-native'
import { GRID_GAP, MIN_TILE, PAGE_PADDING, SIDEBAR_WIDTH } from '../layout'

export function tileWidthFor(windowWidth: number): number {
  const content = windowWidth - SIDEBAR_WIDTH - PAGE_PADDING * 2
  const columns = Math.max(2, Math.floor((content + GRID_GAP) / (MIN_TILE + GRID_GAP)))
  return Math.floor((content - GRID_GAP * (columns - 1)) / columns)
}

export function useGridTile(): number {
  return tileWidthFor(useWindowDimensions().width)
}
