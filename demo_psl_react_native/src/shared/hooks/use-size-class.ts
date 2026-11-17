// A size class says how much room the window has, like UIKit's horizontal size class:
//   compact → phone, iPad in a narrow Split View / Slide Over, a narrow browser window
//   regular → iPad full screen, a Mac window, a wide browser window
// Deciding by width (not by "is this an iPad?") keeps the layout right when the window is resized.
import { useWindowDimensions } from 'react-native'
import { REGULAR_MIN_WIDTH } from '../layout'

export type SizeClass = 'compact' | 'regular'

export function sizeClassFor(width: number): SizeClass {
  return width >= REGULAR_MIN_WIDTH ? 'regular' : 'compact'
}

export function useSizeClass(): SizeClass {
  return sizeClassFor(useWindowDimensions().width)
}
