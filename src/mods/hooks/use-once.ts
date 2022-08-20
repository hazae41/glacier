import { Handle } from "mods/handles"
import { useEffect } from "react"

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce(handle: Handle) {
  const { data, fetch } = handle

  useEffect(() => {
    if (!data) fetch()
  }, [data, fetch])
}