import { useEffect } from "react"
import { Handle } from "../handles"

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce(handle: Handle) {
  const { data, fetch } = handle

  useEffect(() => {
    if (data === undefined) fetch()
  }, [data, fetch])
}