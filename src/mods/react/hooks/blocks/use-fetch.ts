import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param query 
 */
export function useFetch<K, D, F>(query: ReactQuery<K, D, F>) {
  const { ready, fetcher, fetchOrThrow: fetch } = query

  useEffect(() => {
    if (!ready)
      return
    if (fetcher == null)
      return
    fetch().catch(console.warn)
  }, [ready, fetch])
}