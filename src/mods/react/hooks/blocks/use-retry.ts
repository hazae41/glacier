import { ReactQuery } from "mods/react/types/query.js"
import { useEffect, useMemo, useRef } from "react"

export interface RetrySettings {
  readonly init?: number
  readonly base?: number
  readonly max?: number
}

/**
 * Retry request on error using exponential backoff
 * @see useInterval for interval based requests
 * @param query 
 * @param settings
 * @param options.init Initial timeout to be multiplied (in milliseconds)
 * @param options.base Exponent base (2 means the next timeout will be 2 times longer)
 * @param options.max Maximum count (3 means do not retry after 3 retries)
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 * @see https://en.wikipedia.org/wiki/Geometric_progression
 */
export function useRetry<K, D, F>(query: ReactQuery<K, D, F>, settings: RetrySettings = {}) {
  const { ready, cacheKey, refetch, error } = query
  const { init = 1000, base = 2, max = 3 } = settings

  const count = useRef(0)

  useMemo(() => {
    count.current = 0
  }, [cacheKey])

  useEffect(() => {
    if (!ready)
      return

    if (error == null) {
      count.current = 0
      return
    }

    if (count.current >= max)
      return

    const ratio = base ** count.current

    function f() {
      count.current++
      // TODO use suspend or wait cooldown
      refetch().catch(console.warn)
    }

    const t = setTimeout(f, init * ratio)
    return () => clearTimeout(t)
  }, [ready, error, refetch])
}