import { Handle } from "mods/react/hooks/handles"
import { useEffect, useRef } from "react"

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle 
 * @param options 
 */
export function useInterval(handle: Handle, interval: number) {
  const { fetch, skey } = handle

  const fetchRef = useRef(fetch)
  fetchRef.current = fetch

  useEffect(() => {
    if (!interval) return

    const i = setInterval(() => {
      fetchRef.current()
    }, interval)

    return () => clearInterval(i)
  }, [skey, interval])
}