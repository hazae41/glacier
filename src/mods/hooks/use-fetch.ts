import { useEffect } from "react"
import { Handle } from "../handles/index.js"

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useFetch(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    fetch()
  }, [fetch])
}