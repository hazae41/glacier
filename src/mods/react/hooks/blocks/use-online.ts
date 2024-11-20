import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param query 
 */
export function useOnline<K, D, F>(query: ReactQuery<K, D, F>, init?: RequestInit) {
  const { fetcher, ready, fetchOrThrow: fetch } = query

  useEffect(() => {
    if (!ready)
      return
    if (fetcher == null)
      return

    const f = () => fetch(init).catch(console.warn)

    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [ready, fetch])
}