import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useMount(handle: Handle) {
  const { ready, fetch } = handle

  useEffect(() => {
    if (!ready) return

    fetch()
  }, [ready])
}