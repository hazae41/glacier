import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useFetch(handle: Handle) {
  const { fetch, skey } = handle

  useEffect(() => {
    fetch()
  }, [skey])
}