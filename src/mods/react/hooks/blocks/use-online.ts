import { Handle } from "mods/react/hooks/handles"
import { useEffect, useRef } from "react"

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
  const { fetch } = handle

  const fetchRef = useRef(fetch)
  fetchRef.current = fetch

  useEffect(() => {
    const f = () => fetchRef.current()

    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [])
}