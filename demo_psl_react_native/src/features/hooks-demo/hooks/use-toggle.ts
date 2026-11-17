import { useCallback, useState } from 'react'

/** Boolean state with a stable toggle function. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle] as const
}
