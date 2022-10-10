import { Handle } from "mods/react/types/handle.js"
import { useEffect } from "react"

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle 
 * @param options 
 */
export function useInterval(handle: Handle, interval: number) {
  const { ready, fetch } = handle

  useEffect(() => {
    if (!ready) return
    if (!interval) return

    const i = setInterval(fetch, interval)
    return () => clearInterval(i)
  }, [fetch, interval])
}