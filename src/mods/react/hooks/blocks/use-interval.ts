import { Handle } from "mods/react/hooks/handles"
import { useEffect, useRef } from "react"

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle 
 * @param options 
 */
export function useInterval(handle: Handle, interval: number) {
  const { ready, fetch, skey } = handle

  const fetchRef = useRef(fetch)
  fetchRef.current = fetch

  useEffect(() => {
    if (!ready) return
    if (!interval) return

    const i = setInterval(() => {
      fetchRef.current()
    }, interval)

    return () => clearInterval(i)
  }, [ready, skey, interval])
}