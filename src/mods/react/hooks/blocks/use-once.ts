import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce(handle: Handle) {
  const { ready, data, fetch, skey } = handle

  useEffect(() => {
    if (!ready) return

    if (data !== undefined) fetch()
  }, [ready, data, skey])
}