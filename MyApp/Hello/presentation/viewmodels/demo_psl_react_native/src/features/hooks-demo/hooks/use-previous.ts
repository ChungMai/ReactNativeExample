import { useEffect, useRef } from 'react'

/** Remembers the value from the previous render (a ref does not trigger re-renders). */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  })
  // Reading the ref during render is the whole idea of this hook, so the lint rule is disabled here.
  // eslint-disable-next-line react-hooks/refs
  return ref.current
}
