import { useEffect, useState } from 'react'

type FetchState<T> = { data: T | null; loading: boolean; error: string | null }
type Settled<T> = { url: string; data: T | null; error: string | null }

/** Loads JSON from `url` and cancels the request on unmount or when `url` changes. */
export function useFetch<T>(url: string): FetchState<T> {
  // The result remembers which url it belongs to, so "loading" is derived instead of set inside the effect.
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: T) => setSettled({ url, data, error: null }))
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setSettled({ url, data: null, error: e.message })
      })

    return () => controller.abort()
  }, [url])

  const current = settled?.url === url ? settled : null
  return { data: current?.data ?? null, loading: current === null, error: current?.error ?? null }
}
