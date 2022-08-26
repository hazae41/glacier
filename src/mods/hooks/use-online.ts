import { useEffect } from "react"
import { Handle } from "../handles/index.js"

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