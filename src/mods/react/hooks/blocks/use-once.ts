import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param query 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce<K, D, F>(query: ReactQuery<K, D, F>, init?: RequestInit) {
  const { fetcher, ready, data, fetchOrThrow: fetch } = query

  useEffect(() => {
    if (!ready)
      return
    if (fetcher == null)
      return
    if (data != null)
      return
    fetch(init).catch(console.warn)
  }, [ready, data, fetch])
}