import { useAutoRef } from "libs/react/ref.js"
import { Query } from "mods/react/types/query.js"
import { useEffect, useRef } from "react"

export interface RetryOptions {
  init?: number
  base?: number
  max?: number
}

/**
 * Retry request on error using exponential backoff
 * @see useInterval for interval based requests
 * @param query 
 * @param options
 * @param options.init Initial timeout to be multiplied (in milliseconds)
 * @param options.base Exponent base (2 means the next timeout will be 2 times longer)
 * @param options.max Maximum count (3 means do not retry after 3 retries)
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 * @see https://en.wikipedia.org/wiki/Geometric_progression
 */
export function useRetry(query: Query, options: RetryOptions = {}) {
  const { ready, skey, refetch, error } = query
  const { init = 1000, base = 2, max = 3 } = options

  const count = useRef(0)

  useEffect(() => {
    count.current = 0
  }, [skey])

  const refetchRef = useAutoRef(refetch)

  useEffect(() => {
    if (!ready) return

    if (error === undefined) {
      count.current = 0
      return
    }

    if (count.current >= max) return
    const ratio = base ** count.current

    function f() {
      count.current++
      refetchRef.current()
    }

    const t = setTimeout(f, init * ratio)
    return () => clearTimeout(t)
  }, [ready, error])
}