import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param query 
 * @param interval 
 */
export function useInterval<K, D, F>(query: ReactQuery<K, D, F>, interval: number) {
  const { ready, fetch } = query

  useEffect(() => {
    if (!ready)
      return
    if (!interval)
      return

    const f = () => fetch().catch(console.warn)
    const i = setInterval(f, interval)
    return () => clearInterval(i)
  }, [ready, fetch, interval])
}