import { useEffect } from "react"
import { Handle } from "../handles"

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    addEventListener("online", fetch)
    return () => removeEventListener("online", fetch)
  }, [fetch])
}