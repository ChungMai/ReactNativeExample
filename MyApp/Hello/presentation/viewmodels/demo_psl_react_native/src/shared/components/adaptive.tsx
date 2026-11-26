// Picks one of two components by size class: `compact` on a phone-sized window, `regular` on a big one.
// It reads the window size on every render, so resizing a Mac window or opening Split View switches live.
import { createElement, type Attributes, type ComponentType } from 'react'
import { useSizeClass } from '../hooks/use-size-class'

export function adaptive<P extends object>(Compact: ComponentType<P>, Regular: ComponentType<P>): ComponentType<P> {
  return function Adaptive(props: P) {
    const sizeClass = useSizeClass()
    return createElement(sizeClass === 'regular' ? Regular : Compact, props as P & Attributes)
  }
}
