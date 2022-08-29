import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    const f = () => fetch()
    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [fetch])
}