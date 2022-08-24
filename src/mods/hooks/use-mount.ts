import { useEffect } from "react"
import { Handle } from "../handles"

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useMount(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    fetch()
  }, [])
}